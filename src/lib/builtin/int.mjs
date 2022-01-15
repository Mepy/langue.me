console.log("import ./src/lib/builtin/int.mjs")

import {int_type, bool_type, int_gen, bool_gen, fun_gen, call_gen, name_gen, arrow_gen} from "../../ast.mjs"

const int_int_type = arrow_gen(int_type,int_type)
const int_int_int_type = arrow_gen(int_type, int_int_type)
const int_bool_type = arrow_gen(int_type,bool_type)
const int_int_bool_type = arrow_gen(int_type, int_bool_type)

const term = name_gen("term",int_type)
const left = name_gen("left",int_type)
const right = name_gen("right",int_type)

// operator_add = left=>right=>left+right
// ...
const operator_add = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_add",
},int_int_type), int_int_int_type)
const operator_sub = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_sub",
},int_int_type), int_int_int_type)
const operator_mul = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_mul",
},int_int_type), int_int_int_type)
const operator_div = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_div",
},int_int_type), int_int_int_type)
const operator_mod = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_mod",
},int_int_type), int_int_int_type)
const operator_sl = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_sl",
},int_int_type), int_int_int_type)
const operator_sr = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_sr",
},int_int_type), int_int_int_type)

const operator_neg = fun_gen(term, {
    tag:"builtin_int_neg",
},int_int_type)
const operator_not = fun_gen(term, {
    tag:"builtin_int_not",
},int_int_type)
const operator_and = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_and",
},int_int_type), int_int_int_type)
const operator_or = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_or",
},int_int_type), int_int_int_type)
const operator_xor = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_xor",
},int_int_type), int_int_int_type)

const operator_eq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_eq",
},int_bool_type), int_int_bool_type)
const operator_neq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_neq",
},int_bool_type), int_int_bool_type)
const operator_lt = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_lt",
},int_bool_type), int_int_bool_type)
const operator_leq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_leq",
},int_bool_type), int_int_bool_type)
const operator_gt = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_gt",
},int_bool_type), int_int_bool_type)
const operator_geq = fun_gen(left, fun_gen(right,{
    tag:"builtin_int_geq",
},int_bool_type), int_int_bool_type)

const syntax = {
    "builtin_int_add":(left,right)=>call_gen(call_gen(operator_add, left), right),
    "builtin_int_sub":(left,right)=>call_gen(call_gen(operator_sub, left), right),
    "builtin_int_mul":(left,right)=>call_gen(call_gen(operator_mul, left), right),
    "builtin_int_div":(left,right)=>call_gen(call_gen(operator_div, left), right),
    "builtin_int_mod":(left,right)=>call_gen(call_gen(operator_mod, left), right),
    "builtin_int_sl":(left,right)=>call_gen(call_gen(operator_sl, left), right),
    "builtin_int_sr":(left,right)=>call_gen(call_gen(operator_sr, left), right),

    "builtin_int_neg":(term)=>call_gen(operator_neg,term),
    "builtin_int_not":(term)=>call_gen(operator_not,term),
    "builtin_int_and":(left,right)=>call_gen(call_gen(operator_and, left), right),
    "builtin_int_or":(left,right)=>call_gen(call_gen(operator_or, left), right),
    "builtin_int_xor":(left,right)=>call_gen(call_gen(operator_xor, left), right),

    "builtin_int_eq":(left,right)=>call_gen(call_gen(operator_eq, left), right),
    "builtin_int_neq":(left,right)=>call_gen(call_gen(operator_neq, left), right),
    "builtin_int_lt":(left,right)=>call_gen(call_gen(operator_lt, left), right),
    "builtin_int_leq":(left,right)=>call_gen(call_gen(operator_leq, left), right),
    "builtin_int_gt":(left,right)=>call_gen(call_gen(operator_gt, left), right),
    "builtin_int_geq":(left,right)=>call_gen(call_gen(operator_geq, left), right),
}
const semantics = {
    "builtin_int_add":(_,context)=>
        int_gen((context.left.body.int + context.right.body.int)&-1), // cut-off
    "builtin_int_sub":(_,context)=>
        int_gen((context.left.body.int - context.right.body.int)&-1),
    "builtin_int_mul":(_,context)=>
        int_gen((context.left.body.int * context.right.body.int)&-1),
    "builtin_int_div":(_,context)=>
        int_gen((context.left.body.int / context.right.body.int)&-1),
    "builtin_int_mod":(_,context)=>
        int_gen(context.left.body.int % context.right.body.int),
    "builtin_int_sl":(_,context)=>{
        const right_int = context.right.body.int
        if(right_int<32)
            return int_gen(context.left.body.int << right_int)
        else
            return int_gen(0)
    },
    "builtin_int_sr":(_,context)=>{
        const right_int = context.right.body.int
        if(right_int<32)
            return int_gen(context.left.body.int >> right_int) // sra because int is signed
        else
            return int_gen(0)
    }, 

    "builtin_int_neg":(_,context)=>
        int_gen(-context.term.body.int),    
    "builtin_int_not":(_,context)=>
        int_gen(~context.term.body.int),
    "builtin_int_and":(_,context)=>
        int_gen(context.left.body.int & context.right.body.int),
    "builtin_int_or":(_,context)=>
        int_gen(context.left.body.int | context.right.body.int),
    "builtin_int_xor":(_,context)=>
        int_gen(context.left.body.int ^ context.right.body.int),

    "builtin_int_eq":(_,context)=>
        bool_gen(context.left.body.int == context.right.body.int),
    "builtin_int_neq":(_,context)=>
        bool_gen(context.left.body.int != context.right.body.int),
    "builtin_int_lt":(_,context)=>
        bool_gen(context.left.body.int < context.right.body.int),
    "builtin_int_leq":(_,context)=>
        bool_gen(context.left.body.int <= context.right.body.int),
    "builtin_int_gt":(_,context)=>
        bool_gen(context.left.body.int > context.right.body.int),
    "builtin_int_geq":(_,context)=>
        bool_gen(context.left.body.int >= context.right.body.int),
                
}
const context = {
    operator_add,operator_sub,operator_mul,operator_div,operator_mod,
    operator_sl,operator_sr,
    operator_and,operator_or,operator_not,operator_xor,
    operator_eq,operator_neq,operator_lt,operator_leq,operator_gt,operator_geq
}
const int = {syntax, semantics, context}
export default int
