/**
 * map a object to another
 * @author Mepy <angel@mepy.net>
 * @param {Function} fn - (value, option key) -> value
 * @returns {Object}
 */

Object.prototype.map = function(fn){
    return Object.fromEntries(
        Object.entries(this)
        .map(([key, value])=>([key, fn(value, key)]))
    )
}
