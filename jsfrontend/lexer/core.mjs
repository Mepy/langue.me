import { toUnicode, fromUnicode, next_char, prev_char } from "./unicode.mjs"
import { supremum, infimum } from "./search.mjs"
import { DFA, State as DState} from "./shell.mjs"
/* type Value = Uint32 Set */
/**
 * @param {Value} v1 
 * @param {Value} v2 
 * @returns {Boolean}
 */
const value_equal = (v1, v2)=>(v1.size==v2.size)
    &&( Array.from(v1).sort().map(fromUnicode).join('')
      ==Array.from(v2).sort().map(fromUnicode).join(''))

/**
 * v1 \ v2
 * @param {Value} v1 
 * @param {Value} v2 
 * @return {Value} 
 */
const value_differ = (v1, v2)=>{
    const difference = new Set(v1)
    for (const elem of v2)
        difference.delete(elem)
    return difference
}

/**
 * Mapping values to strings, needed when values act as keys of a map.
 * @param {Value} value 
 * @returns {String}
 */
const valueToString = (value)=>Array.from(value).sort().map(fromUnicode).join('')

class Range
{
    constructor(left, right=undefined){
        this.left = left
        if(right==undefined)
            this.right = left
        else
            this.right = right
    }
}
class State
{
    constructor(token)
    {
        this.token = token
        this.left = []
        this.right = []
        this.value = []
        this.empty = []
    }
    /**
     * merge the ranges if they have the same value and are adjacent
     */
    merge(){
        for(var iter=0;iter<this.value.length-1;)
        {
            if(this.right[iter]==prev_char(this.left[iter+1])
            && value_equal(this.value[iter],this.value[iter+1]))
            {
                this.left.splice(iter+1, 1)
                this.right.splice(iter, 1)
                this.value.splice(iter, 1)
            }
            else
                ++iter
        }
    }
    /**
     * [^pattern]
     * 
     * modify it into its not range
     */
    not(){
        const left = []
        const right = []

        const left_bound = this.left[0]
        if(left_bound!=='\u{0}')
        {
            left.push('\u{0}')
            right.push(prev_char(left_bound))
        }
        const length = this.value.length-1
        for(var iter=0;iter<length;)
        {
            const left_char = next_char(this.right[iter])
            ++iter
            const right_char = prev_char(this.left[iter])
            if(left_char<=right_char)
            {
                left.push(left_char)
                right.push(right_char)
            }
        }
        const right_bound = this.right[length]
        if(left_bound!=='\u{10FFFF}')
        {
            left.push(next_char(right_bound))
            right.push('\u{10FFFF}')
        }
        this.left = left.sort()
        this.right = right.sort()
        const delta = this.value.length-left.length
        if(delta>=0)
            this.value.splice(0, delta)
        else 
            this.value.splice(0, 0, this.value[0])
    }
    insert(range, value){
        const right_i = infimum(this.left,range.right)
        if(right_i==-1) // not_found -> range.right < this.left, disjoint
        {
            this.left.unshift(range.left)
            this.right.unshift(range.right)
            this.value.unshift(value)
            return;
        }
        const left_i = supremum(this.right,range.left)
        if(left_i==-1) // not_found -> this.right < range.left, disjoint
        {
            this.left.push(range.left)
            this.right.push(range.right)
            this.value.push(value)
            return;
        }
        if(right_i<left_i) // [_ _] |   | [_ _] => disjoint
        {
            this.left.splice(left_i,0,range.left)
            this.right.splice(left_i,0,range.right)
            this.value.splice(left_i,0,value)
            return;
        }

        // range joint, spilt algorithm

        const right = this.right[right_i]
        if(right<range.right) // [_ _] ... |
        {
            this.left.splice(right_i+1, 0, next_char(right))
            this.right.splice(right_i+1, 0, range.right)
            this.value.splice(right_i+1, 0, new Set(value))
            range.right = right
        }
        else if(range.right<right) // [_ | ... _]
        {
            // next_char(r.r) exists because r.r<this.right[right_i]
            this.left.splice(right_i+1, 0, next_char(range.right))
            this.right.splice(right_i, 0, range.right)
            this.value.splice(right_i, 0, new Set([...this.value[right_i]]))
        }
        // make sure this.right[right_i] == range.right
        for(var iter=right_i;left_i<iter;--iter)
        {
            this.value[iter] = new Set([...this.value[iter], ...value])

            const new_left = next_char(this.right[iter-1])
            const new_right = prev_char(this.left[iter]) // iter<=left_i ensure
            if(new_left<=new_right)
            {
                this.left.splice(iter, 0, new_left)
                this.right.splice(iter, 0, new_right)
                this.value.splice(iter, 0, value)
            }
        }


        const left = this.left[left_i]
        if(left<range.left) // [_ | ... _]
        {
            // prev_char(r.l) exists because this.left[left_i]<r.l
            this.right.splice(left_i, 0, prev_char(range.left))
            this.left.splice(left_i+1, 0, range.left)
            this.value.splice(left_i+1, 0, new Set([...this.value[left_i], ...value]))
        }
        else if(range.left<left) // | ... [_ _]
        {
            this.right.splice(left_i, 0, prev_char(left))
            this.left.splice(left_i, 0, range.left)
            this.value[left_i] = new Set([...this.value[left_i],...value])
            this.value.splice(left_i, 0, new Set(value))
        }
        else// range.left = left |_ _]
            this.value[left_i] = new Set([...this.value[left_i],...value])
        
    }
}

// relative index
class NFA
{
    constructor(...ranges){ 
        this.states = 
        [ new State(0) 
        , new State(1) // token = 1 when constructing
        ] 
        // initial state index = 0
        const initial_state = this.states[0]
        ranges.forEach(range=>initial_state.insert(range,[1])) 
        initial_state.merge()
    }
    eof(value){
        var result = value
        var unvisit = value
        for(;;)
        {
            const new_result = new Set([].concat(...Array.from(unvisit)
                .map(index=>this.states[index].empty.map(delta=>delta+index))
            ))
            unvisit = value_differ(new_result, result)
            if(unvisit.size==0)
                break
            result = new Set([...new_result, ...result])
        }
        return result
    }
    /**
     * transform a NFA to an equivalent DFA with token kept
     * @return {DFA}
     * @return {NFA}
     */
    determinate(){
        // subset algorithm : 
        const unvisit = [
            this.eof(new Set([0]))
        ]
        const dfa_state = {}
        const key_to_index = {}
        const key_of_initial_state = valueToString(unvisit[0])
        var index_of_dfa_state = 0
        dfa_state[key_of_initial_state] = new State(0)
        key_to_index[key_of_initial_state] = ++index_of_dfa_state
        for(;unvisit.length;)
        {
            var current = unvisit.shift()
            const dstate = dfa_state[valueToString(current)]

            // set token
            const token_list = Array.from(new Set( // remove duplicate tokens
                Array.from(current).map(index=>this.states[index].token)))
                .filter(token=>token!=0)
            if(token_list.length>1)
                throw ({tag:"token", msg:`one input, different tokens accepted.`, tokens:token_list})
            if(token_list.length==1)
                dstate.token = token_list[0]
            else
                dstate.token = 0

            
            // state transition
            Array.from(current).forEach(index=>{
                const state = this.states[index]
                const left = state.left
                const right = state.right
                const value = state.value
                const length = value.length
                for(var i=0;i<length;++i)
                {
                    dstate.insert(new Range(left[i],right[i]), 
                        new Set(Array.from(value[i]).map(_=>_+index)) // relative -> absolute
                    )
                }
            })
            // become eof
            dstate.value = dstate.value.map(value=>this.eof(value))

            // merge ranges in state
            dstate.merge()

            // increase unvisit subset
            dstate.value.forEach(subset=>{
                const key = valueToString(subset)
                if( ! (key in dfa_state)) // if unvisit
                {
                    unvisit.unshift(subset)
                    dfa_state[key] = new State(0)
                    key_to_index[key] = ++index_of_dfa_state
                }
            })

        }
        // construct DFA with dfa_state and key_to_index

        const states = [new DState()]
        Object.keys(dfa_state).forEach(key=>{
            const index = key_to_index[key]
            const nstate = dfa_state[key]

            const dstate = new DState( nstate.token
                                     , new Uint32Array(nstate.left.map(toUnicode))
                                     , new Uint32Array(nstate.right.map(toUnicode))
                                     , nstate.value.map(_=>key_to_index[valueToString(_)]))
            states[index] = dstate
        })
        return new DFA(states)
    }

    /**
     * create an nfa accepting char
     * @param {Char} char 
     * @return {NFA}
     */
    static single(char){ return new NFA(new Range(char)) }
    /**
     * create an nfa accepting range from left to right
     * @param {Char} left
     * @param {Char} right
     * @return {NFA}
     */
    static range(left, right){ return new NFA(new Range(left, right)) }
    /**
     * create an nfa accepting ^ranges
     * @param  {RangeArray} ranges 
     * @return {NFA}
     */
    static brackets(ranges){ return new NFA(...ranges.map(range=>new Range(...range))) }
    /**
     * create an nfa accepting ^ranges
     * @param  {RangeArray} ranges 
     * @return {NFA}
     */
    static not(ranges){
        const nfa = new NFA(...ranges.map(range=>new Range(...range)))
        nfa.states[0].not()
        return nfa
    }
    /**
     * create an nfa accepting one symbol
     * @param  {...Range} ranges 
     * @return {NFA}
     */
    static all(){ return new NFA(new Range('\u{0}','\u{10FFFF}')) }
    /**
     * create an nfa accepting one of nfas, with token = 1 + index of nfas
     * @param {NFAArray} nfas
     * @return {NFA}
     */
    static token_union(nfas){
        const ret = new NFA()
        const initial_state = ret.states[0]
        nfas.map((nfa,index)=>{
            const length = nfa.states.length
            const halt_state = nfa.states[length-1]
            halt_state.token = 1 + index // set not halt by the way
            return length
        }).reduce((total,length)=>{
            initial_state.empty.push(total)
            return total+length
        },1)
        ret.states = [].concat([initial_state],...nfas.map(nfa=>nfa.states))
        return ret
    }
    /**
     * create an nfa accepting one of nfas
     * @param {NFAArray} nfas
     * @return {NFA}
     */
    static union(nfas){
        const ret = new NFA()
        const initial_state = ret.states[0]
        const halting_state = ret.states[1]
        const halt_length = nfas.map(nfa=>{
            const length = nfa.states.length
            const halt_state = nfa.states[length-1]
            halt_state.token = 0 // set not halt by the way
            return ([halt_state, length])
        })
        const length = halt_length.reduce((total,[halt_state, length])=>{
            const next = total+length
            halt_state.empty.unshift(-next)
            initial_state.empty.push(total)
            return next
        },1)+1
        halt_length.forEach(([halt_state])=>{
            halt_state.empty[0]+=length
        })
        ret.states = [].concat([initial_state],...nfas.map(nfa=>nfa.states),[halting_state])
        return ret
    }
    /**
     * create an nfa accepting ...nfas
     * @param {NFAArray} nfas
     * @return {NFA}
     */
    static seq(nfas){ 
        const ret = new NFA()
        const last_of_nfas = nfas.length-1
        nfas.forEach((nfa,index)=>{
            if(index!=last_of_nfas)
            {
                const length = nfa.states.length
                const halt_state = nfa.states[length-1]
                halt_state.token=0
                halt_state.empty.unshift(1)
            }
        })
        ret.states = [].concat(...nfas.map(nfa=>nfa.states))
        return ret
    }
    /**
     * create an nfa accepting nfa*
     * @param {NFA} nfa
     * @return {NFA}
     */
    static star(nfa){
        const ret = new NFA()
        const initial_state = ret.states[0]
        const halting_state = ret.states[1]
        const last = nfa.states.length-1
        const halt_state = nfa.states[last]
        initial_state.empty.unshift(1,last+2)
        halt_state.empty.unshift(-last,1)
        halt_state.token = 0
        ret.states = [initial_state, ...nfa.states, halting_state]
        return ret
    }
    /**
     * create an nfa accepting nfa+
     * @param {NFA} nfa 
     * @return {NFA}
     */
    static plus(nfa){ 
        // return NFA.seq(nfa, NFA.star(nfa))
        const ret = new NFA()
        const initial_state = ret.states[0]
        const halting_state = ret.states[1]
        const last = nfa.states.length-1
        const halt_state = nfa.states[last]
        initial_state.empty.unshift(1)
        halt_state.empty.unshift(-last,1)
        halt_state.token = 0
        ret.states = [initial_state, ...nfa.states, halting_state]
        return ret
    }

}

export { NFA }