console.log("import ./src/lib/builtin/int.mjs")

import {int_type, bool_type, int_gen, bool_gen, fun_gen, call_gen, name_gen, arrow_gen} from "../../ast.mjs"

const int_int_type = arrow_gen(int_type,int_type)
const int_int_int_type = arrow_gen(int_type, int_int_type)
const int_bool_type = arrow_gen(int_type,bool_type)
const int_int_bool_type = arrow_gen(int_type, int_bool_type)

const left = name_gen("left",int_type)
const right = name_gen("right",int_type)

// operator_add = left=>right=>left+right
// ...
const operator_add = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_add",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_sub = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_sub",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_mul = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_mul",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_div = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_div",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_mod = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_mod",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_sl = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_sl",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_sr = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_sr",
    body:{left,right}
},int_int_type), int_int_int_type)
const operator_eq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_eq",
    body:{left,right}
},int_bool_type), int_int_bool_type)
const operator_neq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_neq",
    body:{left,right}
},int_bool_type), int_int_bool_type)
const operator_lt = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_lt",
    body:{left,right}
},int_bool_type), int_int_bool_type)
const operator_leq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_leq",
    body:{left,right}
},int_bool_type), int_int_bool_type)
const operator_gt = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_gt",
    body:{left,right}
},int_bool_type), int_int_bool_type)
const operator_geq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_geq",
    body:{left,right}
},int_bool_type), int_int_bool_type)

const syntax = {
    "builtin_int_add":(left,right)=>call_gen(call_gen(operator_add, left), right),
    "builtin_int_sub":(left,right)=>call_gen(call_gen(operator_sub, left), right),
    "builtin_int_mul":(left,right)=>call_gen(call_gen(operator_mul, left), right),
    "builtin_int_div":(left,right)=>call_gen(call_gen(operator_div, left), right),
    "builtin_int_mod":(left,right)=>call_gen(call_gen(operator_mod, left), right),
    "builtin_int_sl":(left,right)=>call_gen(call_gen(operator_sl, left), right),
    "builtin_int_sr":(left,right)=>call_gen(call_gen(operator_sr, left), right),
    "builtin_int_eq":(left,right)=>call_gen(call_gen(operator_eq, left), right),
    "builtin_int_neq":(left,right)=>call_gen(call_gen(operator_neq, left), right),
    "builtin_int_lt":(left,right)=>call_gen(call_gen(operator_lt, left), right),
    "builtin_int_leq":(left,right)=>call_gen(call_gen(operator_leq, left), right),
    "builtin_int_gt":(left,right)=>call_gen(call_gen(operator_gt, left), right),
    "builtin_int_geq":(left,right)=>call_gen(call_gen(operator_geq, left), right),
}
const semantics = {
    "builtin_int_add":({left,right},context)=>
        int_gen(context[left].body.int + context[right].body.int),
    "builtin_int_sub":({left,right},context)=>
        int_gen(context[left].body.int - context[right].body.int),
    "builtin_int_mul":({left,right},context)=>
        int_gen(context[left].body.int * context[right].body.int),
    "builtin_int_div":({left,right},context)=>
        int_gen(Math.floor(context[left].body.int / context[right].body.int)),
    "builtin_int_mod":({left,right},context)=>
        int_gen(context[left].body.int % context[right].body.int),
    "builtin_int_sl":({left,right},context)=>
        int_gen((context[left].body.int * (2**context[right].body.int))%(2**32)),
    "builtin_int_sr":({left,right},context)=>
        int_gen(Math.floor(context[left].body.int / (2**context[right].body.int))),

    "builtin_int_eq":({left,right},context)=>
        bool_gen(context[left].body.int == context[right].body.int),
    "builtin_int_neq":({left,right},context)=>
        bool_gen(context[left].body.int != context[right].body.int),
    "builtin_int_lt":({left,right},context)=>
        bool_gen(context[left].body.int < context[right].body.int),
    "builtin_int_leq":({left,right},context)=>
        bool_gen(context[left].body.int <= context[right].body.int),
    "builtin_int_gt":({left,right},context)=>
        bool_gen(context[left].body.int > context[right].body.int),
    "builtin_int_geq":({left,right},context)=>
        bool_gen(context[left].body.int >= context[right].body.int),
                
}
const context = {
    operator_add,operator_sub,operator_mul,operator_div,operator_mod,
    operator_sl,operator_sr,
    operator_eq,operator_neq,operator_lt,operator_leq,operator_gt,operator_geq
}
const int = {syntax, semantics, context}
export default int
