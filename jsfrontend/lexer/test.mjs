
// const dfa = load("./ll.o")
// console.log(json)
// const dfa = DFA.fromJSON(json)
// console.log(dfa.scan('baaba'))
import { save, save_json, load } from "./node.mjs"
import { DFA } from "./shell.mjs"
import { NFA } from "./core.mjs"
import { compile } from "./compiler.mjs"
import * as fs from "fs"

const nfa = NFA.token_union([NFA.seq([NFA.single('b'),NFA.single('a')]),NFA.not([['a','b'],['c']]),NFA.star(NFA.single('a'))])

const dfa = nfa.determinate()
console.log(
    JSON.stringify(DFA.fromJSON(JSON.stringify(dfa)))
)
save(dfa, "ba|[^a-c]|a*.lcb")

const rules = JSON.parse(fs.readFileSync(`./langue.me.lexer.rules.json`))
const {lexer,tokens} = compile(rules)
console.log(
    JSON.stringify(lexer),
    lexer.toBuffer(),
)


save(lexer, `./langue.me.lexer.core.bin`)
save_json(lexer, `./langue.me.lexer.core.json`)
console.log(
    lexer.scan(`
    $ id = {Type}=> term:Type => term ;
    $ boolean = {
        $ B1 = 
            | False
            | True 
            ;
    }
    `)
    .map(({token, source})=>({token:tokens[token], source}))
    .filter(({token})=>token!=="space"),
)
const dd = compile(".*\.json")
save(dd, "./json.core.bin")
save_json(dd, "./json.core.json")

const json_a = compile({
    "json":".*\.json",
    "a":"a"
})
console.log(json_a.lexer.scan("x.jsonaaaa"))
save(json_a.lexer,"json_a.lcb")
save(compile("abc"),"abc.lcb")

save(compile(
{ column5:"column5"
, Vanadium: "Vanadium"
, lilac:"lilac"
, dot:"\\."
}).lexer, "lilac.lcb")