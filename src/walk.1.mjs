import * as gen from "./generator.mjs"

import * as err from "./exception.mjs"
import * as map from "./utils/map.mjs"
import * as log from "./utils/log.mjs"
import "./utils/Object.map.mjs"

let test =  // gen.variable(true, "x", gen.literal(3, gen.I8))
gen.variable(false, "operator+",
    gen.func(gen.name("x"),
        gen.func(gen.tuple([gen.name("y"),gen.name("z")]),
            gen.binary(gen.literal(5, gen.I8), "+",
                gen.binary(gen.name("x"),"*", gen.name("y"))
            )
        )
    )
/*
    gen.func(gen.tuple([gen.name("x"),gen.name("y")]),
        gen.binary(gen.literal(5, gen.I8), "+",
            gen.binary(gen.name("x"),"*", gen.name("y"))
        )
    )
    */
)
/*
gen.block([
    gen.variable(false, "x", 
        gen.binary(
            gen.literal(3, gen.I8),"+",gen.literal(4, gen.I8)
        )
    ),

    // decurrying
    gen.variable(false, "f",
        gen.func(gen.name("x"),
            gen.func(gen.name("y"),
                gen.binary(gen.literal(5, gen.I8), "+",
                    gen.binary(gen.name("x"),"*", gen.name("y"))
                )
            )
        )
    ),

    // recursive function
    gen.variable(false, "fib",
        gen.func(gen.name("n"),
            gen.ternary(gen.binary(gen.name("n"),"<",gen.literal(2,gen.I8)),
                gen.literal(1, gen.I8),
                gen.binary(
                    gen.call(gen.name("fib"),gen.binary(gen.name("n"),"-",gen.literal(1,gen.I8))),
                    "+",
                    gen.call(gen.name("fib"),gen.binary(gen.name("n"),"-",gen.literal(2,gen.I8))),
                )
            )
        )
    ),

    gen.call(gen.name("f"),gen.name("x"))
])
*/



const table = {}
const name_map = map.gen()


var name_counter = 0
var Unknown_Type_Counter = 0

const func_decurry = func=>{
    if(func.body.tag!="func")
        return func
    else
    {
        const new_func = func_decurry(func.body.body) // func.body is a term, body of term
        const new_para = gen.tuple([func.para, new_func.para])
        return ({para:new_para, body:new_func.body})
    }
}
const para_decurry = (para)=>
    (para.tag=="name")?[para.body.name]
    :(para.tag=="tuple")?para.body.tuple
        .map(para_decurry)
        .reduce((total,next)=>[...total, ...next], [])
    :(()=>{throw err.para_format(para)})()


const walk = ({tag, body, type, location}, table, name_map)=>{
const res_walk = ({
    "lib":(body)=>({tag:"lib", body, type}),
    "literal":({value})=>gen.literal(value, type),
    "array":({array})=>gen.array(array.map(item=>walk(item, table, name_map))),
    "list":({list})=>gen.list(list.map(item=>walk(item, table, name_map))),
    "tuple":({tuple})=>gen.array(tuple.map(item=>walk(item, table, name_map))),
    "sequence":({sequence})=>gen.sequence(sequence.map(item=>walk(item, table, name_map))),
    "block":({block})=>gen.block(block.map(item=>walk(item, table, name_map))),
    "struct":({struct})=>gen.struct(struct.map(item=>walk(item, table, name_map))),
    
    "ternary":({cond,fst,snd})=>gen.ternary(
        walk(cond, table, name_map),
        walk(fst, table, name_map),
        walk(snd, table, name_map)
    ),
    "name":({name})=>{
        if(name in name_map)
            return gen.name(name_map[name], type, location)
        else 
            throw err.unbound_name(name, location)
    },
    "variable":({muty, name:name, term})=>{
        if(name in name_map)
        {
            
            if(term.tag!="func") 
            // no muty overload for non-func(even after simply compile-time eval)
                throw err.declare_twice(name, location)
            
            const counter = name_map[name]
            const entry = table[counter]
            if(muty|entry.muty)
                throw err.mutable_overload_function(name, location)
            console.log(entry.term)
            
            if(entry.term.tag!="func"&&entry.term.tag!="overload")
                throw err.declare_twice(name, location)

            
            ++name_counter
            name_map[name] = name_counter
            table[name_counter] = gen.overload(term, entry.term)

            walk(term, table, name_map)
            
            return gen.name(name_counter)
        }
        else
        {
            ++name_counter
            name_map[name] = name_counter
            const old_counter = name_counter
            const new_term = walk(term, table, name_map) // walk add a name
            table[old_counter] = ({
                tag:muty?"mut":"let",
                muty, name, term:new_term, location, type:new_term.type, 
                end:name_counter // [old_counter:name_counter] are all the names of this term
            })
            return gen.name(name_counter)
        }
    },
    "func":(func)=>{
        const {para, body} = func_decurry(func)
        const decurried_para = para_decurry(para)
        const new_map = map.gen({},name_map)
        decurried_para.forEach(name=>{
            ++name_counter
            table[name_counter] = ({tag:"para", name:para.body.name})
            new_map[name]=name_counter
        })
        return gen.func(gen.tuple(decurried_para.map(name=>gen.name(new_map[name]))),
            walk(body, table, new_map),
            type, location
        )
    },
    "call":({func, para})=>{
        // TODO : call_decurry 
        return gen.call(
            walk(func, table, name_map),
            walk(para, table, name_map)
        )
    },
    "unary":({oper,term})=>walk(
        gen.call(
            gen.name(`unary${oper}`),
            walk(term, table, name_map)
        ),table, name_map
    ),
    "binary":({left, oper, right})=>{
        if(oper==".") // dot operator
        {
            if(right.tag!="name")
                throw err.dot_right_not_name(right)

            const obj = walk(left, table, name_map)
            try {
                const method_name = walk(right, table, name_map) // if method
                return gen.dot(
                    obj,
                    method_name,
                    right, // if field
                    type
                )
            }
            catch(no_method_error)
            {
                // no such method, so it must be the field name
                return walk(
                    gen.call(gen.name(`operator${oper}`),gen.tuple([obj,right])),
                    table, name_map    
                )
            }
            
        }
        return walk(
            gen.call(gen.name(`operator${oper}`),gen.tuple([left,right])),
            table, name_map
        )
    },
})[tag](body)
// 
    if(["literal","name","func"].some(item=>item==res_walk.tag))
        return res_walk

    ++name_counter
    const name = gen.name(name_counter)
    table[name_counter] = ({tag:"tmp", term:res_walk, type:res_walk.type})
    return name
}
import * as I8 from "./lib/builtin/I8.mjs"
walk(I8.header, table, name_map)
walk(test, table, name_map)

log.obj(
    test
)
log.json(
    table
)