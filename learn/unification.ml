type name = string;;
type term = 
    | Var of name
    | Abs of name * term
    | App of term * term
    | Bool of bool
    | Int of int
    | If of term * term * term
    | Add of term * term
    (* | Let of name * term * term let name = term in term *)
    ;;
exception ExpectAbs of term;;
exception ExpectBool of term;;
exception ExpectInt of term;;

let rec replace (term:term) (name:name) (value:term) = match term with
    | Var name' -> if name = name' then value else term
    | Abs(argu, body) -> if argu = name then Abs(argu, body) else Abs(argu, replace body name value)
    | App(func, para) -> App(replace func name value, replace para name value)
    | If(cond, fst, snd) -> If(replace cond name value, replace fst name value, replace snd name value)
    | Add(left, right) -> Add(replace left name value, replace right name value)
    | _ -> term
    ;;

let apply func para = match func with
    | Abs(argu, body) -> replace body argu para
    | _ -> raise (ExpectAbs(func))
    ;;

let isval term = match term with
    | Var _     -> true
    | Abs (_,_) -> true
    | App (_,_) -> false
    | Bool _ -> true
    | Int _ -> true
    | _ -> false
    ;;
    
let rec step term = match term with 
    | App(func, para) -> 
        if isval func then 
        (
            if isval para 
            then apply func para
            else App(func, step para)
        )
        else
            App(step func, para)
    
    | If(cond,fst,snd) ->
        if isval cond then
        (
            match cond with
            | Bool(bool) -> if bool then fst else snd
            | _ -> raise (ExpectBool(cond))
        )
        else
            If(step cond, fst, snd)
    | Add(left, right) ->
        if isval left then
        (
            if isval right then
            (
                match left with
                | Int(lef) -> 
                (
                    match right with 
                    | Int(rig) -> Int(lef+rig)
                    | _ -> raise (ExpectInt(right))
                )
                | _ -> raise (ExpectInt(left))
            )
            else
            (
                Add(left, step right)
            )
        )
        else
            Add(step left, right)
    | _ -> term
;;

let rec eval term = if isval term 
    then term 
    else 
        try eval (step term) 
        with ExpectAbs(_) -> term | ExpectInt(_) -> term | ExpectBool(_) -> term
;;
type ty = 
    | Bool_ty
    | Int_ty
    | Arrow of ty * ty
    | Unknown of name
    ;;

exception UnknownType of term;;
exception UnknownName of name;;
let type_check term = match term with
    | Bool(_) -> Bool_ty
    | Int(_) -> Int_ty
    | _ -> raise (UnknownType(term))
    ;;

type constrait = Equal of ty * ty;;
let unknown_type_gen = let counter = ref(0) in
    fun () -> incr counter; Unknown("Var" ^ string_of_int !counter)
    ;;

type res_con = {ty:ty;constrs:constrait list;};;
module Name2Ty = Map.Make(String);;
type context = ty Name2Ty.t;;
let rec constrait_type term context = match term with
    | Var(name) -> ( match Name2Ty.find_opt name context with 
        | Some(typ) -> {
            ty = typ;
            constrs = [];
        }
        | None -> raise (UnknownName(name))
    )
    | Abs(name, term') -> let typ = unknown_type_gen() in
        let res = constrait_type term' (Name2Ty.add name typ context) in {
            ty = Arrow(typ, res.ty);
            constrs = res.constrs;
        }
    | App(func, para) -> let func_res = constrait_type func context in 
        let para_res = constrait_type para context in 
        let typ = unknown_type_gen() in
    {
        ty = typ;
        constrs = Equal(func_res.ty, Arrow(para_res.ty, typ))::func_res.constrs@para_res.constrs
    }
    | Add(left, right) -> let left_res = constrait_type left context in
        let right_res = constrait_type right context in
    {
        ty = Int_ty;
        constrs = Equal(left_res.ty, Int_ty)::Equal(right_res.ty, Int_ty)::left_res.constrs@right_res.constrs
    }
    | If(cond,fst,snd) -> let cond_res = constrait_type cond context in
        let fst_res = constrait_type fst context in
        let snd_res = constrait_type snd context in
    {
        ty = fst_res.ty;
        constrs = Equal(cond_res.ty, Bool_ty)::Equal(fst_res.ty, snd_res.ty)::cond_res.constrs@fst_res.constrs@snd_res.constrs
    }
    | Int(_) -> { ty=Int_ty; constrs=[]; }
    | Bool(_) -> {ty=Bool_ty;constrs=[];}
;;

let rec sing_sub constrait typ = match constrait with 
    | Equal(left_ty, right_ty)-> (
        match typ with 
        | Unknown(_) -> if left_ty = typ then right_ty else typ 
        | Arrow(para, body) -> Arrow(sing_sub constrait para, sing_sub constrait body )
        | _ -> typ
    ) ;;
let rec substitute constraits typ = match constraits with
    | [] -> typ
    | x::t -> substitute t (sing_sub x typ)
;;

let type_infer term = let ct = constrait_type term Name2Ty.empty in 
    substitute ct.constrs ct.ty
;;


let var name = Var name;;
let abs argu body = Abs(argu, body);;
let app func para = App(func, para);;
let if' cond fst snd = If(cond, fst, snd);;
let add left right = Add(left, right);;
let tru = Bool(true);;
let fls = Bool(false);;
let x = Int(3) and y = Int(4) and z = Int(5);;
let test = add x y in eval test;;
let test = if' tru fls x in eval test;;
let test = add (app (abs "x" (var "x")) (add x y)) z in eval test;;
let to_infer = abs "x" (add (var "x") y);

let test = (abs "z" (if' (var "z") (abs "y" (add (app (abs "x" (var "x")) (add x (var "y"))) z)) y )) in type_infer test;;