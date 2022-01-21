
const syntax_error = (message,location) => ({tag:"syntax",message,location})
const context_error = (message,location) => ({tag:"context",message,location})
const declare_twice = (name,location) => syntax_error(`'${name}' has already been declared`,location)
const mutable_overload_function = (name,location) => syntax_error(`function '${name}' should be declared with not 'var' but 'let'`,location)
const arg_format = (arg,location) => syntax_error(`${arg} is not a name for arg`, location)
const para_format = (para,location) => syntax_error(`${para} is not a name for para`, location)
const unbound_name = (name,location) => context_error(`${name} is not found`, location)
const dot_right_not_name = (right, location) => syntax_error(`${right} is not a name`, location)
export {declare_twice, mutable_overload_function, arg_format, para_format, unbound_name, dot_right_not_name}