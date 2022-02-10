## lexer.core.bin.spec
一个二进制文件```*.lexer.core.bin```（后缀任意，简略起见可以用```*.lcb```）\
存储了一个确定性有穷自动机 Deterministic Finite Automata, DFA 的全部信息。\
其存储的均为32位无符号整数，即 JavaScript 的 Uint32 或 c/cpp 的 unsigned ，下称整数。\
用 ```[index]``` 表示第index个整数。

```[0]``` = dfa.states.length 是自动机状态的数目

紧接着依次为第0个状态，第1个状态，...，第 ```[0]``` 个状态的信息。以第0个状态 ```state = dfa.states[0]``` 为例:

```[1]``` = state.token 是状态的标记 token
- token=0 表示非停机状态
- token!=0 表示停机状态
  不同的token表示不同的词素 lexeme 
  
```[2]``` = state.left.length \
= state.right.length \
= state.value.length \
```[2]``` 表示接下来有3 * ```[2]``` 个整数，依次为：\
state.left[0], state.left[1], ..., state.left[```[2]```] \
state.right[0], state.right[1], ..., state.right[```[2]```] \
state.value[0], state.value[1], ..., state.value[```[2]```] 

在第0个状态的信息之后，紧跟着第1个状态的信息。\
状态的信息间没有分隔符，如此到第```[0]```个状态的信息。

关于state.left, state.right, state.value，参见```lexer.shell.spec.md``` 。