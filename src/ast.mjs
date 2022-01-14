// 2022/01/12 23:30-24:33
// 2022/01/13 10:31-10:41
// 2022/01/14 22:10-

/* --- Type --- */
const bool_type = ({tag:"bool_ty",body:undefined}) 
const char_type = ({tag:"char_ty",body:undefined})
const int_type = ({tag:"int_ty",body:undefined})
const float_type = ({tag:"float_ty",body:undefined})
/* --- Type --- */


/* --- Term --- */
// literal
const bool_gen = bool=>({tag:"bool",body:{bool},type:bool_type})
const char_gen = char=>({tag:"char",body:{char},type:char_type})
const int_gen = int=>({tag:"int",body:{int},type:int_type})
const float_gen = float=>({tag:"float",body:{float},type:float_type})
const array_gen = array=>({tag:"array",body:{array}})
const list_gen = list=>({tag:"list",body:{list}}) // linked list implemented by polymorphism
const tuple_gen = tuple=>({tag:"tuple",body:{tuple}})
const dict_gen = record=>({tag:"dict",body:{record}}) // {key:value;key:value}
const block_gen = block=>({tag:"block",body:{block}}) // code block = {term;term;term;}

// unary operation - logic
const not_gen = (left,right)=>({tag:"or",body:{left,right}})

// binary operation - logic
const and_gen = (left,right)=>({tag:"and",body:{left,right}})
const or_gen = (left,right)=>({tag:"or",body:{left,right}})

// binary operation - arithmetic
const add_gen = (left,right)=>({tag:"add",body:{left,right}})
const sub_gen = (left,right)=>({tag:"sub",body:{left,right}})
const mul_gen = (left,right)=>({tag:"mul",body:{left,right}})
const div_gen = (left,right)=>({tag:"div",body:{left,right}})
const mod_gen = (left,right)=>({tag:"mod",body:{left,right}})

// binary operation - compare
const eq_gen = (left,right)=>({tag:"eq",body:{left,right}})
const neq_gen = (left,right)=>({tag:"neq",body:{left,right}})
const lt_gen = (left,right)=>({tag:"lt",body:{left,right}})
const leq_gen = (left,right)=>({tag:"leq",body:{left,right}})
const gt_gen = (left,right)=>({tag:"gt",body:{left,right}})
const geq_gen = (left,right)=>({tag:"geq",body:{left,right}})

// binary operation - stream
const sl_gen = (left,right)=>({tag:"sl",body:{left,right}}) // left "<<" left
const sr_gen = (left,right)=>({tag:"sr",body:{left,right}}) // left ">>" right

// binary operation - function
const fun_gen = (arg,ret)=>({tag:"fun",body:{arg,ret}})
const call_gen = (fun,arg)=>({tag:"call",body:{fun,arg}})

// binary operation - variable
const var_gen = (name,value)=>({tag:"var",body:{name,value}}) // mutable
const let_gen = (name,value)=>({tag:"let",body:{name,value}}) // immutable

/**
 * ternary operation - temporary variable <br>
 * grammar list : <br>
 * term "where" name "=" value <br>
 * "let" name "=" value "in" term <br>
 * @param {Term} term 
 * @param {String} name 
 * @param {Term} value 
 * @returns {Term}
 */
const where_gen = (term,name,value)=>({tag:"where",body:{term,name,value}})

// ternary operation - control
const if_gen = (cond,fst,snd)=>({tag:"if",body:{cond,fst,snd}})

// quaernary operation - control
const for_gen = (init,cond,next,body)=>({tag:"for",body:{init,cond,next,body}})

// extension
const match_gen = (types,funs)=>({tag:"match",body:{types,funs}})

/* --- Term --- */

/* --- Type --- */

const product_gen = (types)=>({tag:"product",body:{types}})
const sum_gen = (types)=>({tag:"sum",body:{types}})
const arrow_gen = (arg,ret)=>({tag:"arrow",body:{arg,ret}})
const pow_gen = (type,length)=>({tag:"pow",body:{type,length}})
const record_gen = (keys,types)=>({tag:"record",body:{keys,types}})

const alias_gen = (name,type)=>({tag:"alias",body:{name,type}}) // type alias  Alias := Int
const wrap_gen = (name,type)=>({tag:"wrap",body:{name,type}}) // type wrap     Wrap = Int


// to support c's pointer or cpp's reference
const ptr_gen = type=>({tag:"ptr",body:{type}}) // only mutable
const ref_gen = type=>({tag:"ref",body:{type}}) // only immutable

// TODO:recursive type

/* --- Type --- */

/* --- Term : Type --- */
// We just make type become a sub field of term
// i.e let x : Int = 2 -> ast = {tag:"let",body:{int:2},type:Int} 

/* --- Module --- */
// TODO with universal and existential types