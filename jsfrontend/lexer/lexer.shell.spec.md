## lexer.shell.spec
本文件负责解释```shell.mjs```中的相关概念。
- token 
  - =0 非终止状态 Non-Halting States
  - != 0 终止状态 Halting States
- left[i] \
  第i个区间的左端点 Left Endpoint of the i-th Range
- right[i] \
  第i个区间的右端点 Right Endpoint of the i-th Range
- value[i] \
  第i个区间应当转移到的下一个状态的(绝对)下标 the (Absolute) Index of Next State of the i-th Range