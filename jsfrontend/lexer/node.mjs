import { DFA } from "./shell.mjs"

import * as fs from "fs"

const save = (dfa,path)=>fs.writeFileSync(path, new DataView(dfa.toBuffer()))
const load = (path)=>DFA.fromBuffer(fs.readFileSync(path).buffer, 16) // 16 header??
const save_json = (dfa,path)=>fs.writeFileSync(path, JSON.stringify(dfa))
const load_json = (path)=>DFA.fromJSON(fs.readFileSync(path).toString())

export { save, load, save_json, load_json }