#import "../../lib/theme.typ": chapter

#chapter(
  title: "逻辑、证明与计算",
  summary: [
    有了元素、集合、数与表示之后，本章建立第二层工具：
    怎样用逻辑精确描述问题，怎样证明算法正确，怎样用不变量刻画循环，
    怎样用递归与归纳描述结构，以及什么叫计算、怎样度量代价。
  ],
)[
  #include "01-logic.typ"
  #include "02-proof.typ"
  #include "03-state-invariant.typ"
  #include "04-recursion-induction.typ"
  #include "05-computation.typ"
  #include "06-cost.typ"
]

#include "appendix.typ"
