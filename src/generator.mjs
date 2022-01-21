
/* --- Type --- */
const Type = ({tag:"Type"})
const U0 = ({tag:"U0",type:Type}) // Unit
const U1 = ({tag:"U1",type:Type}) // 1 Byte, unsigned char
const U2 = ({tag:"U2",type:Type}) // 2 Bytes, unsigned short
const U4 = ({tag:"U4",type:Type}) // 4 Bytes, unsigned int
const U8 = ({tag:"U8",type:Type}) // 8 Bytes, unsigned long
const I1 = ({tag:"I1",type:Type})
const I2 = ({tag:"I2",type:Type})
const I4 = ({tag:"I4",type:Type})
const I8 = ({tag:"I8",type:Type}) 
const F4 = ({tag:"F4",type:Type})
const F8 = ({tag:"F8",type:Type})
const B1 = ({tag:"B1",type:Type}) // bool -> might be implemented with sum types in langue.me
const C1 = ({tag:"C1",type:Type}) // 1 Byte, char
const C2 = ({tag:"C2",type:Type}) // 2 Bytes, wchar in Windows' c standard library
const C4 = ({tag:"C4",type:Type}) // 4 Bytes, gchar in glib library

const Array = (Type, length)=>({tag:"Array", body:{Type, length}, type:Type})
const List = (Type)=>({tag:"List", body:{Type}, type:Type})
const Tuple = (...Types)=>({tag:"List", body:{Types}, type:Type})
const Struct = (Struct)=>({tag:"Struct", body:{Struct}, type:Type})

/**
 * Overload Type , or Sum Type <br>
 * @param {Type} Fst
 * @param {Type} Snd 
 * @returns {Type.Overload}
 */
const Overload = (Fst, Snd)=>({tag:"Overload", body:{Overload:[
    ...(Fst.tag=="Overload"?Fst.body.Overload:[Fst]),
    ...(Snd.tag=="Overload"?Snd.body.Overload:[Snd]),
]}})

/**
 * Arrow Type , or Type of functions <br>
 * @param {Type} Para 
 * @param {Type} Body 
 * @returns {Type.Arrow}
 */
const Arrow = (Para, Body)=>({tag:"Arrow", body:{Para, Body}, type:Type})

/**
 * Unknown Type, used for Type infering
 * @param {Int} Counter 
 * @returns 
 */
const Unknown = (Counter)=>({tag:"Unknown", body:{Counter}, type:Type})

/* --- Type --- */

/* --- Term --- */
const unit = ({tag:"literal", type:U0})
const literal = (value, type)=>({tag:"literal", body:{value}, type}) // Primitive Type

// The following term usually has no type anotation, while sometimes checker needs.
const array = (array, type)=>({tag:"array",body:{array}, type}) // [a,b,c] for C? remain
const list = (list, type)=>({tag:"list",body:{list}, type}) // [a;b;c] linked list implemented by polymorphism
const tuple = (tuple, type)=>({tag:"tuple",body:{tuple}, type}) // (a, b, c)
const struct = (struct, type)=>({tag:"struct",body:{struct}, type}) // {key:value,key:value,key:value}
const sequence = (sequence, type)=>({tag:"sequence",body:{sequence}, type}) // code sequence = {term, term, term} no block scope
const block = (block, type)=>({tag:"block",body:{block}, type}) // code block = {term;term;term;}


// operator : Which will not be used in type system, they are syntax sugars
/**
 * unary operator <br>
 * "not" for !, "neg" for -, "pos" for +, "star" for * <br>
 * @param {String} oper 
 * @param {Term} term 
 * @param {Type} type 
 * @returns Term
 */
const unary = (oper, term, type)=>({tag:"unary",body:{oper, term}, type})
/**
 * binary operator <br>
 * "add" for +, "sub" for - , etc. <br>
 * @param {Term} left 
 * @param {String} oper 
 * @param {Term} right 
 * @param {Type} type 
 * @returns Term
 */
const binary = (left, oper, right, type)=>({tag:"binary",body:{left,oper,right}, type})

/**
 * introduce a variable, mutable or immutable <br>
 * in the 1st walking ask, it will becomes Term.name <br>
 * @param {Boolean} muty - mutability 
 * @param {Term.name} name - currently no support for destructing Term.tuple or Term.struct of name
 * @param {Term} term 
 * @param {Type} type 
 * @returns {Term.variable}
 * 
 */
const variable = (muty, name, term, type)=>({tag:"variable", body:{muty, name, term}, type})

/**
 * introduce a Type variable <br>
 * in the 1st walking ask, it will becomes Type.Name <br>
 * @param {Type.Name} Name
 * @param {Type} Type_
 * @returns {Type.Variable}
 * 
 */
const Variable = (Name, Type_)=>({tag:"Variable", body:{Name, Type:Type_}, type:Type})

// Core AST in Type System
/**
 * name of variable, or variable in lambda calculus <br>
 * situations when a variable is consumed.
 * @param {String} name 
 * @param {Type} type 
 * @returns Term.name
 */
const name = (name, type)=>({tag:"name", body:{name}, type})

/**
 * implement of function, or abstraction in lambda calculus <br>
 * @param {Term.name+Term.tuple} para - currently no support for destructing Term.struct of name
 * @param {Term} body 
 * @param {Type} type 
 * @returns {Term.func}
 */
const func = (para, body, type)=>({tag:"func", body:{para, body}, type})
/**
 * call of function, or application in lambda calculus <br>
 * @param {Term} func 
 * @param {Term} para 
 * @param {Type} type 
 * @returns {Term.call}
 */
const call = (func, para, type)=>({tag:"call", body:{func, para}, type})

/**
 * ternary operator <br>
 * if cond then fst else snd <br>
 * cond ? fst : snd <br>
 * because Typeof(fst) = Typeof(snd) = any Type OK
 * @param {Term:B1} cond 
 * @param {Term} fst 
 * @param {Term} snd 
 * @param {Type} type 
 * @returns Term
 */
const ternary = (cond, fst, snd, type)=>({tag:"ternary",body:{cond, fst, snd}, type})

/**
 * dot operator(binary) needs type info to determinate <br>
 * obj.name <br>
 * @param {Term} obj 
 * @param {Term.name} method
 * @param {Term.name} field
 * @param {Type} type 
 * @returns {Term.dot} 
 */
const dot = (obj, method, field, type)=>({tag:"dot", body:{obj, method, field}, type})

/**
 * overload function needs type info to determinate <br>
 * @param {Term.func|Term.overload} fst
 * @param {Term.func|Term.overload} snd 
 * @returns {Term.overload}
 */
const overload = (fst, snd)=>({tag:"overload", body:{overload:[
    ...(fst.tag=="func"?[fst]:fst.body.overload),
    ...(snd.tag=="func"?[snd]:snd.body.overload),
]}})


/**
 * name of Type variable, or Type variable in system F <br>
 * situations when a Type variable is consumed.
 * @param {String} Name  
 * @returns Type.Name
 */
const Name = (Name)=>({tag:"Name", body:{Name}, type:Type})

/**
 * Type abstraction in system F <br>
 * @param {Term.name} Para
 * @param {Term|Type} body 
 * @returns {Type.Func}
 */
const Func = (Para, body)=>({tag:"Func", body:{Para, body}, type:Type})
 /**
  * Type application in System <br>
  * @param {Type} Func 
  * @param {Term} Para 
  * @returns {Type.Call}
  */
const Call = (Func, Para)=>({tag:"Call", body:{Func, Para}, type:Type})

const lib = (identifier)=>({tag:"lib", body:({identifier})})

export {
    U0, U1, U2, U4, U8, I1, I2, I4, I8, F4, F8, B1, C1, C2, C4,
    Array, List, Tuple, Struct, 
    Overload, Arrow, Unknown, 
    unit, literal, array, list, tuple, struct, block, sequence,
    unary, binary,
    variable, Variable,
    name, func, call,
    dot, overload, ternary,
    Name, Func, Call,
    lib
}