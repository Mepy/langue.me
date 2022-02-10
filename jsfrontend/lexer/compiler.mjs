import { NFA } from "./core.mjs"
import { nihil } from "./nihil.mjs"

const esc_slash = nihil(/\\\\/).map(_=>'\\')
const esc_dot = nihil(/\\\./).map(_=>'.')
const esc_star = nihil(/\\\*/).map(_=>'*')
const esc_plus = nihil(/\\\+/).map(_=>'+')
const esc_minus = nihil(/\\\-/).map(_=>'-')
const esc_caret = nihil(/\\\^/).map(_=>'^')
const esc_bar = nihil(/\\\|/).map(_=>'|')
const esc_left_bracket = nihil(/\\\[/).map(_=>'[')
const esc_right_bracket = nihil(/\\\]/).map(_=>']')
const esc_left_parentheses = nihil(/\\\(/).map(_=>'(')
const esc_right_parentheses = nihil(/\\\)/).map(_=>')')
const esc = nihil.or(
    esc_slash, esc_dot, esc_star, esc_plus, esc_minus, esc_caret, esc_bar,
    esc_left_bracket, esc_right_bracket, esc_left_parentheses, esc_right_parentheses,
)
const reject_no_esc = nihil(/[^\\\.\*\+\-\^\|\[\]\(\)]/u)
const symbol = nihil.or(esc, reject_no_esc)
const range_in_btrackets = nihil.and(symbol,/\-/,symbol)
    .map(([left,_,right])=>([left, right]))
const single_in_btrackets = symbol
    .map(char=>([char]))
const in_btrackets = nihil.or(range_in_btrackets, single_in_btrackets).loop()

const not = in_btrackets.wrap(/\[\^/,/\]/)
    .map(NFA.not)
const brackets = in_btrackets.wrap(/\[/,/\]/)
    .map(NFA.brackets)
const all = nihil(/\./).map(NFA.all)


// re -> re1 '|' re1
// re1 -> re2.loop
// re2 -> re3 (*|+)
// re3 -> (brackets|not|all|symbol|)

const re4 = nihil.parser(_=>regexp_parser(_))
const re3 = nihil.or(not, brackets, all, 
    symbol.map(NFA.single)
, re4.wrap(/\(/,/\)/))
const re2 = 
    nihil.and(re3,/\*|\+/)
    .map(([re3,loop])=>{
        if(loop=='*')
            return NFA.star(re3)
        else
            return NFA.plus(re3)
    })
    .or(re3)
const re1 = re2.loop().map(NFA.seq)
const regexp_parser = re1.and(nihil.and(/\|/,re1).map(([_,$])=>$).loop())
    .map(([$0, array])=>NFA.union([$0,...array]))
    .or(re1)

const rules = 
    { comment : "//[^\n]*\n|/\\*(([^\\*]*\\*[^/])*|[^\\*]*\\*/)" // using // and /* */ as comment |
    , term_name : "[a-z][a-zA-Z0-9_]*" // (([^\\*]*\\*[^/])*|[^\\*]*\\*/)
    , type_name : "[A-Z][a-zA-Z0-9_]*" // 
    , dec : "0|[1-9][0-9]*"
    , bin : "0b(0|1[01]*)"
    , oct : "0o(0|[1-7][0-7]*)"
    , hex : "0x(0|[1-9a-fA-F][0-9a-fA-F]*)"
    , str : '"[^"]*"'
    , rstr : 'r"[^"]*"' // raw string, "\n" is '\' 'n'
    , let : "\$"
    , mut : "\$:"
    , init : "="
    , set : ":="
    , at : "@"
    , term_arrow : "=>"
    , import : "<\\.>"
    , export : ">\\.<"
    , plus : "\\+"
    , minus : "\\-"
    , mult : "\\*"
    , space : "[ \n\t]+"
    , div : "/"
    , lt : "<?"
    , leq : "<=?|/>?"
    , gt : ">?"
    , geq : ">=?|/<?"
    , eq : "=?"
    , eqv : "==?"
    , neq : "/=?"
    , neqv : "/==?"
    , ls : "<<"
    , rs : ">>"
    , and : "&"
    , or : "\\|"
    , xor : "\\^"
    , tilde : "~"
    , not : "!"
    , aand : "&&"
    , oor : "\\|\\|"
    , xxor : "\\^\\^"
    , ttilde : "~~"
    , nnot : "!!"
    , left_parenthesis : "\\(" 
    , rigth_parenthesis : "\\)"
    , left_brace : "{"
    , right_brace : "}"
    , left_bracket : "\\["
    , right_bracket : "\\]"
    , comma : ","
    , semincolon : ":"
    , colon : ";"
}

/**
 * compile multi rules into lexer and its tokens
 * compile single rule into lexer
 * @param {Object|String} rules 
 * @returns 
 */
const compile = rules=>{
    console.log(rules, typeof(rules))
    if(typeof(rules)=='object')
    {
        const tokens = [''].concat(Object.keys(rules))
        const lexer = NFA.token_union(Object.entries(rules).map(([token,regexp])=>{
            try {
                return regexp_parser.try(regexp)
            } catch (error) {
                throw ({tag:'regexp', token, regexp})
            }
        })).determinate()
        return ({lexer, tokens})
    }
    else if(typeof(rules)=='string')
    {
        try {
            return regexp_parser.try(rules).determinate()
        } catch (error) {
            throw ({tag:'regexp', regexp:rules})
        }
    }
    else
        throw ({tag:'unknown', msg:"unknown rules format!"})
}


export { compile }
