/**
 * from char to unicode point
 * @param {Char} char 
 * @returns {Uint32}
 */
const toUnicode = char=>char.codePointAt(0)

/**
 * from unicode point to char
 * @param {Uint32} unicode
 * @returns {Char}
 */
const fromUnicode = unicode=>String.fromCodePoint(unicode)

/**
 * return the next of char in unicode
 * @param {Char} char 
 * @returns {Char}
 */
const next_char = char=>String.fromCodePoint(char.codePointAt(0)+1)

/**
 * return the previous of char in unicode
 * @param {Char} char 
 * @returns {Char}
 */
const prev_char = char=>String.fromCodePoint(char.codePointAt(0)-1)

export { toUnicode, fromUnicode, next_char, prev_char }