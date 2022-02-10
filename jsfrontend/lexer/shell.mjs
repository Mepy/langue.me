const endian = true
import { toUnicode, fromUnicode } from "./unicode.mjs"
import { supremum, infimum } from "./search.mjs"

class Lexeme
{
    constructor(token, begin, end)
    {
        this.token = token
        this.begin = begin
        this.end = end
    }
}
class State
{
    constructor( token=0
               , left=new Uint32Array(0)
               , right=new Uint32Array(0)
               , value=new Uint32Array(0)){ 
        this.token = token
        this.left = left
        this.right = right
        this.value = value
    }
    next(char){
        const unicode = toUnicode(char)
        const left = supremum(this.right, unicode)
        const right = infimum(this.left, unicode)
        if(left!=right||left==-1||right==-1)
            return 0 // Not Found
        return this.value[left]
    }
    toJSON(){ return (
        { token:this.token
        , left:[...this.left].map(fromUnicode)   // Uint32Array -> Array .map
        , right:[...this.right].map(fromUnicode) // Uint32Array -> Array .map
        , value:[...this.value] })
    }
    static fromObject({token, left, right, value}){
        return new State( token
                        , left.map(toUnicode)
                        , right.map(toUnicode)
                        , value )
    }
    static fromJSON(json){
        return State.fromObject(JSON.parse(json))
    }
    size(){ return 4*(2+3*this.value.length) }
    toBuffer(buffer, offset){
        const length = this.value.length
        const view = new DataView(buffer, offset)
        view.setUint32(0, this.token, endian)
        view.setUint32(4, length, endian)
        this.left.forEach((char, index)=>{
            view.setUint32(4*(2+index), char, endian)
        })
        this.right.forEach((char, index)=>{
            view.setUint32(4*(2+length+index), char, endian)
        })
        this.value.forEach((item, index)=>{
            view.setUint32(4*(2+length+length+index), item, endian)
        })
    }
    static fromBuffer(buffer, offset=0){
        const view = new DataView(buffer)
        const token = view.getUint32(offset, endian)
        const length = view.getUint32(offset+4, endian)
        const size = 4 * length;
        const left = new Uint32Array(buffer, offset+8, length)
        const right = new Uint32Array(buffer, offset+8+size, length)
        const value = new Uint32Array(buffer, offset+8+size+size, length)
        return new State(token, left, right, value)
    }
}
class DFA
{
    constructor(states){
        this.states = states
    }
    /**
     * greedily read source, return a Lexeme
     * @param {String} source 
     * @returns {Lexeme}
     */
    read(source, begin){
        const lexeme = new Lexeme(0, begin, begin)
        var current_state = this.states[1] // initial state
        var end=begin
        for(;;)
        {
            const unicode = source[end]
            ++end
            if(unicode==undefined)
                break;
            
            const next_state_index = current_state.next(unicode)
            if(next_state_index==0)
                break;

            const next_state = this.states[next_state_index]
            if(next_state.token!==0)
            {
                lexeme.token = next_state.token
                lexeme.end = end
            }
            current_state = next_state
        }
        return lexeme
    }
    /**
     * greedily scan source, return [Lexeme]
     * @param {String} source 
     * @returns {LexemeArray}
     */
    scan(source){
        const result = []
        var begin = 0;

        for(;source[begin]!==undefined;)
        {
            const lexeme = this.read(source, begin)
            lexeme.source = source.slice(lexeme.begin, lexeme.end)
            if(lexeme.token==0)
                throw ({msg:`scan trap at ${lexeme.end}`, result, remain:source.slice(lexeme.end)})
            else
                result.push(lexeme)
            begin = lexeme.end
        }

        return result
    }
    toJSON(){ return this.states }
    static fromJSON(json){
        return new DFA(JSON.parse(json).map(State.fromObject));
    }
    toBuffer(){
        const state_size = this.states.map(state=>([state, state.size()]))
        const size = 4+state_size.reduce((s,[_,x])=>s+x,0)
        const buffer = new ArrayBuffer(size)
        const view = new DataView(buffer)
        view.setUint32(0, this.states.length, endian)
        state_size.reduce((offset, [state,size])=>{
            state.toBuffer(buffer, offset)
            return offset+size
        },4)
        return buffer
    }
    static fromBuffer(buffer, offset=0){
        const view = new DataView(buffer)
        const length = view.getUint32(offset, endian)
        const states = new Array(length)
        offset+=4
        for(var i=0;i<length;++i)
        {
            states[i] = State.fromBuffer(buffer, offset)
            offset += states[i].size()
        }
        return new DFA(states)
    }
}
export { State, DFA }