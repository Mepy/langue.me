console.log("import ./src/lib/io/node.mjs")

import {arrow_gen, name_gen, fun_gen, call_gen,  unit, int_type, unit_type} from "../../ast.mjs"

const int = name_gen("int",int_type)
const int_unit_type = arrow_gen(int_type, unit_type)
const print_int = fun_gen(int,{
    tag:"node_out_int",
},int_unit_type)
const syntax = {
    "node_out_int":(int)=>call_gen(print_int,int)
}
const semantics = {
    "node_out_int":(_,context)=>{
        process.stdout.write(context.int.body.int+"")
        return unit;
    }
}
const context = { 
    print:[print_int]
}
const io = {syntax, semantics, context}
export default io