#import "../../lib/ku.typ": ku-notes

#ku-notes(
  id: "ds.01.03.relations-functions",
  title: "关系、函数与结构",
)[
  === 实验
  Web 实验 `lab.relations-functions`：在有限集合上点击元素对构造关系，
  实时判断它是否自反、对称、传递；对函数则检查单射、满射、双射，
  并显示关系矩阵与等价类划分。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 2.1 and Sections 9.1-9.5.
  - Cormen et al., *Introduction to Algorithms*, 4th ed., Appendix B.

  === 连接
  - 1.4 用后继函数构造自然数。
  - 1.8 把“集合 + 关系”抽象成数据类型。
  - 2.1 用谓词精确描述关系与函数。
  - 后面的树、图、并查集都是特殊的关系结构。

  === 易错点
  - 关系不一定是函数：一个输入可以对应多个输出。
  - 笛卡尔积有顺序：$A times B$ 与 $B times A$ 一般不同。
  - 等价关系与偏序不是一回事：等价关系允许对称，偏序要求反对称。
  - 双射要求“单射”和“满射”同时成立，缺一不可。

  === 练习
  动态练习 `ex.ds.01.03`：判断关系的自反/对称/传递性，求等价类；
  判断函数是单射、满射还是双射；由关系矩阵还原关系。
]
