class State
{
    toJSON(){ return [ this.token
        , this.left.map(fromUnicode)
        , this.right.map(fromUnicode)
        , this.value ] }
    static fromArray([token, left, right, value]){
    return new State( token
    , left.map(toUnicode)
    , right.map(toUnicode)
    , value )
    }
    static fromJSON(json){
    return State.fromArray(JSON.parse(json))
    }
}

const transport = json=>{
    const {states} = JSON.parse(json)
    return JSON.stringify(
        states.map(state=>({token:state.token
                           , left:state.map.left._
                           , right:state.map.right._
                           , value:state.map.value }))
    )
}

const json = transport(`
    {"states":[{"token":0,"map":{"left":{"_":[]},"right":{"_":[]},"value":[]}},{"token":2,"map":{"left":{"_":["a","b"]},"right":{"_":["a","b"]},"value":[2,3]}},{"token":2,"map":{"left":{"_":["a"]},"right":{"_":["a"]},"value":[2]}},{"token":0,"map":{"left":{"_":["a"]},"right":{"_":["a"]},"value":[4]}},{"token":1,"map":{"left":{"_":[]},"right":{"_":[]},"value":[]}}]}
    `)



    if(range.left=='r')
    console.log("ir3",`ri=${right_i}, li=${left_i}`, this.left.length, this.value.length)