/**
 * map implmented with Proxy
 * @author Mepy <angel@mepy.net>
 * @param {Map} map - option
 * @param {Map} parent - option
 * @returns {Map}
 * 
 */

const gen = (parent,map)=>{
    if(map==undefined)
        map={}
    const variable = new Proxy(map,{
        get : (target,key)=>{
            if(key=="..") // 不暴露父
            {
                if(target[".."]==target)
                    return undefined
                else
                    return target[".."]
            }
            // key!=".."
            if(target[key]!==undefined)
            {
                return target[key]
            }
            else if(target[".."]!==target) // 不为根
                return target[".."][key]
            else
                return undefined
        },
        set : (target,key,value)=>{
            if(value !== undefined)
                return Reflect.set(target,key,value)
            else
                Reflect.deleteProperty(target, key)
        },
        deleteProperty : (target, key)=>{
            Reflect.deleteProperty(target, key)
        },
        has : (target,key)=>{
            if(key=="..")
                return false
            else if(Reflect.has(target, key))
                return true
            else if(target[".."]!==target) // 不为根
                return target[".."][key]
            else
                return false
        }
    })
    if(parent===undefined)
        variable[".."] = map // root
    else
        variable[".."] = parent
    return variable
}
/**
 * immutable add
 * @param {Map} map 
 * @param {String} key 
 * @param {*} value 
 * @returns {Map}
 * 
 */
const add = (key, value, old_map) => {
    const new_map = {}
    new_map[key]=value
    return gen(new_map,old_map)
}

export {gen,add}
