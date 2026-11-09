#import "../../lib/theme.typ": chapter

#chapter(
  title: "从元素到整数",
  summary: [
    本章从最底层开始：什么是元素，什么是集合，集合怎样运算，关系与函数如何描述结构；
    然后从 0 与后继构造自然数，从计数走到位置记数法，再从自然数对构造整数，
    最后落到计算机中的位、字节与补码。每一步都同时给出数学定义、计算机表示和一个可交互实验。
  ],
)[
  #include "01-elements-sets.typ"
  #include "02-set-operations.typ"
  #include "03-relations-functions.typ"
  #include "04-natural-numbers.typ"
  #include "05-counting-positional.typ"
  #include "06-integers-twos-complement.typ"
  #include "07-computer-representation.typ"
  #include "08-abstract-representation.typ"
]
