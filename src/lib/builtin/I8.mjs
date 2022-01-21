import * as gen from "../../generator.mjs"

const ast = gen.name

const I8xI8 = gen.Tuple(gen.I8, gen.I8)
const I8xI8_I8 = gen.Arrow(I8xI8, gen.I8)

const left = gen.name("left",gen.I8)
const right = gen.name("right",gen.I8)

const para = gen.tuple([left, right], I8xI8)

const header = gen.sequence([
    gen.variable(false, "operator+", 
        gen.func(para,gen.lib("operator+_I8"),I8xI8_I8)
    ),
    gen.variable(false, "operator*", 
        gen.func(para,gen.lib("operator*_I8"),I8xI8_I8)
    ),
])

export {header}