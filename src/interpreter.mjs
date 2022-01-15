import {unit,int_gen, call_gen} from "./ast.mjs"
import io from "./lib/io/node.mjs"
import int from "./lib/builtin/int.mjs"

const context_gen = ({context,parent})=>{
    if(context==undefined)
        context={}
    const variable = new Proxy(context,{
        get : (target,key)=>{
            if(key=="..") // 不暴露父，方便序列化
            {
                if(target[".."]==target)
                    return unit
                else
                    return target[".."]
            }
            // key!=".."
            if(target[key]!==undefined)
            {
                // const value = target[key]
                return target[key]
                // return load_context(value.value.context,copy(value)) // 总是copy
            }
            else if(target[".."]!==target) // 不为根
                return target[".."][key]
            else
                return unit
        },
        set : (target,key,value)=>{
            if(value !== unit)
                return Reflect.set(target,key,value)
            else
            {
                //const old_value = target[key]
                delete target[key]
                //return old_value
            }
        },
        has : (target,key)=>{
            if(key=="..")
                return false
            else if(target[key]!=undefined)
                return true
            else if(target[".."]!==target) // 不为根
                return target[".."][key]
            else
                return false
        }
    })
    if(parent===undefined)
        variable[".."] = context // root
    else
        variable[".."] = parent
    return variable
}
/**
 * 
 * @param {context} ctx1 
 * @param {context} ctx2 
 * @returns {context}
 * ctx1 -> ctx11 -> ... -> ctx1m -> top <br>
 * ctx2 -> ctx21 -> ... -> ctx2n -> top <br>
 * ret = ctx1 -> ctx11 -> ... -> ctx1m ->
 * 
 */

const context_merge = (ctx1,ctx2)=>{

}
const load = (term,context,store)=>{
    if(term.context==undefined)
        term.context=context
    if(term.store==undefined)
        term.store=store
    return term
}
const value_tag_list = ["unit","int","fun"]
const is_value = ({tag})=>value_tag_list.some(item=>tag==item)
const not_value = ({tag})=>value_tag_list.every(item=>tag!=item)
const semantics = {
    "call":({fun,arg},context,store)=>{
        if(not_value(fun))
            return load(call_gen(
                load(step(fun),context,store),
                arg),context,store)
        if(not_value(arg))
            return load(call_gen(fun,
                load(step(arg),context,store)
                ),context,store)
        else
        {
            const {arg:{body:{name}},ret} = fun.body
            const sub_context = context_gen({parent:fun.context}) 
            
            // !!! fun.context + context
            // One question is that because of currying
            // we don't know how many levels of fun.context are args.
            // we might have to make a sub field of fun.body to record
            // the lexi-closure

            sub_context[name] = arg
            return load(ret,sub_context,store)
        }
    }
}
Object.assign(semantics,io.semantics)
Object.assign(semantics,int.semantics)
console.log(semantics)
const step = ({tag,body,context,store})=>{
    // console.log(tag)
    return semantics[tag](body,context,store)
}

const exec = term=>{
    console.log("exec",term)
    var result;
    for(result=term;not_value(result);result=step(result))
        console.log("step",result)
    return result
}
const int_x = int_gen(3)
const int_y = int_gen(4)
const add_x_y = int.syntax.builtin_int_add(int_x,int_y)
exec(io.syntax.node_out_int(add_x_y))
