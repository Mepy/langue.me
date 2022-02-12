## lexer
### 代码结构
- [test.mjs](./test.mjs) \
  测试代码
- [shell.mjs](./shell.mjs) \
  DFA与贪婪扫描的实现，相关概念见[shell.spec.md](./lexer.shell.spec.md)
- [core.mjs](./core.mjs) \
  区间分割的插入 insert with Range spliting \
  NFA->DFA : Determination
- [compiler.mjs](./compiler.mjs) \
  依赖 [nihil](https://github.com/Mepy/nihil) 库实现的正则表达式解析器，并且调用 [core.mjs](./core.mjs) 生成 NFA
- [node.mjs](./node.mjs) \
  Node.js 的文件读写操作，将 DFA 状态数据保存为JSON或二进制文件(详见[core.bin.spec.md](./lexer.core.bin.spec.md))
- 工具库 utils
  - [search.mjs](./search.mjs) 区间二分搜索 supremum infimum
  - [unicode.mjs](./unicode.mjs) Unicode字符集