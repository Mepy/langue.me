/**
 * Assume array is ordered.
 * return the index in array of the smallest item' >= item, if no return -1
 * @param {Array} array
 * @param {*} item 
 * @returns {Index}
 */
const supremum = (array, item)=>{
    var left = 0
    var right = array.length-1
    if(left>right||array[right]<item)
        return -1
    for(;right-left>1;)
    {
        const middle = Math.floor((left+right)/2)
        if(array[middle]<item)
            left=middle
        else if(item<array[middle])
            right=middle
        else 
            return middle
    }
    if(array[left]<item)
        return right
    else
        return left
}
/**
 * Assume array is ordered.
 * return the index in array of the largest item' <= item, if no return -1
 * @param {Array} array
 * @param {*} item 
 * @return {Index}
 */
const infimum = (array, item)=>{
    var left = 0
    var right = array.length-1
    if(left>right||item<array[left])
        return -1
    for(;right-left>1;)
    {
        const middle = Math.floor((left+right)/2)
        if(array[middle]<item)
            left=middle
        else if(item<array[middle])
            right=middle
        else 
            return middle
    }
    if(item<array[right])
        return left
    else
        return right
}

export { supremum, infimum }