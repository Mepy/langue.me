/**
 * module : nihil
 * author : Mepy
 * version : 0.3.0
 * date : 20220207
 */
const nihil = expected => {
    if(typeof(expected)=="function"){return expected}//parser
    if(expected.raw){return nihil.nihil}
    else{
        const RE = new RegExp(expected.source,expected.flags+"y");//"y" used at ima
        return nihil.parser(source=>{
            const start = source.ima
            RE.lastIndex = start;
            
            if(start==source.raw.length){return {
                right:false, error:{expected:String(expected),location:source.ima},
            }}
            
            const matchResult = source.raw.match(RE);
        
            if(matchResult)
            {
                if(matchResult[0].length==0)
                    return nihil.nihil
                const end = start + matchResult[0].length
                source.ima = end;
                
                return {right:true, value:matchResult[0]}
                //value is a array [] for the convenience of merge
            }
            else
            {
                return {right:false, error:{expected:String(expected),location:source.ima}}
            }
        })
    }
}

//special result
nihil.nihil = {right:true, nihil:true}//return when nihil as a parser

nihil.source = raw =>({raw,ima:0})

nihil.and = (...parsers)=>{
    const Parsers = parsers.map(nihil);
    for( ; Parsers[0]!==undefined && Parsers[0] == nihil ; Parsers.shift() );
    const parser = (source)=>{
        const value = []
        for(const parser of Parsers)
        {
            const val = parser(source);
            if(val.right)
            {
                if(val.nihil)
                    ;
                else
                    value.push(val.value);
            }
            else
                return val;
        }
        return {right:true, value};
    };
    return nihil.parser(parser);
}
nihil.or = (...parsers)=>{
    const Parsers = parsers.map(nihil)
    for( ; Parsers[0]!==undefined && Parsers[0] == nihil ; Parsers.shift() );
    const error = [];
    const parser = source=>{
        const ima = source.ima;
        for(const parser of Parsers)
        {
            const value = parser(source);
            if(value.right)
                return value;
            else
            {
                source.ima = ima;
                error.push(value.error)
            }
        }
        return {right:false, error};
    }
    return nihil.parser(parser);
}
nihil.keep = A=>selector=>nihil.parser(source=>{
    const a = A(source);
    if(a.right==false){return a;}
    const B = selector(a.value);
    const b = B(source);

    if(b.right==false){return b;}

    return ({right:true, value:[...a.value, b.value]});
})
nihil.drop = A=>selector=>nihil.parser(source=>{
    const a = A(source);
    if(a.right==false){return a;}
    const B = selector(a.value)
    const b = B(source);
    if(b.right==false){return b;}
    if(b.nihil){return b;}

    return {right:true, value:b.value};
})
nihil.error = error=>nihil.parser(source=>({right:false, error}))
nihil.box = value=>nihil.parser(source=>({right:true, value}))

nihil.map = Parser=>Mapper=>nihil.parser(source=>{
    const result = Parser(source)
    if(result.value)
        result.value = Mapper(result.value)
    return result;
})

nihil.sep = Parser=>seper=>nihil.parser(source=>{
    seper(source);
    const value = Parser(source);
    seper(source);
    return value;
})
//const unfold = a=>(a.length == 1)?a:([a[0],...a[1]])
nihil.loop = //Parser=>Parser.and(_=>Parser(_)).map(unfold).or(nihil)

Parser=>nihil.parser(source=>{
    const value = [];
    for(;;)
    {
        const ima = source.ima;
        const val = Parser(source);
        if(val.right)
        {
            if(val.nihil)
                break;
            else
                value.push(val.value);
        }
        else
        {
            source.ima = ima;
            break;
        }
    }
    return {right:true, value};
})

nihil.wrap = (left,parse,right)=>nihil.and(left,parse,right).map(([l,v,r])=>v)

nihil.parser = parse =>{
    parse.and = (...parsers)=>nihil.and(parse,...parsers)
    parse.or = (...parsers)=>nihil.or(parse,...parsers)

    parse.keep = nihil.keep(parse)
    parse.drop = nihil.drop(parse)
    parse.map = nihil.map(parse)

    parse.loop = ()=>nihil.loop(parse)
    parse.sep = (seper)=>nihil.sep(parse)(nihil(seper))
    parse.wrap = (left,right)=>nihil.wrap(nihil(left),parse,nihil(right))

    parse.label = (label)=>nihil.label(parse)(label)
    parse.locate = ()=>nihil.locate(parse)

    parse.try = (raw)=>{
        const result = parse.parse(raw)
        if(result.right!=true)
            throw result.error;
        return result.value;
    }
    parse.parse = (raw)=>{
        const source = nihil.source(raw)
        const result = parse(source)
        if(result.right!=true)
            return result;
        if(source.ima!=source.raw.length)
            return ({right:false, error:{expected:"<eof>",location:source.ima}});
        return result;
    }
    return parse
}

nihil.location = nihil.parser(source=>({right:true, value:source.ima}))

nihil.label = parser=>label=>parser.map(value=>({label,value}))
nihil.locate = parser=>nihil
    .and(nihil.location,parser,nihil.location)
    .map(([beg,value,end])=>({beg,value,end}))

nihil.dynamic = ()=>{
    const parsers = {}
    const parser = nihil.parser(source=>{
        const error = [];
        const ima = source.ima;
        for(const parser of Object.values(parsers))
        {
            const value = parser(source);
            if(value.right)
                return value;
            else
            {
                source.ima = ima;
                error.push(value.error)
            }
        }
        return {right:false, error};
    })
    parser.insert = ({name,parser})=>{
        parsers[name] = parser
    }
    parser.remove = ({name})=>{
        const parser = parsers[name]
        delete parsers[name]
        return parser
    }
    return parser
}
export { nihil }