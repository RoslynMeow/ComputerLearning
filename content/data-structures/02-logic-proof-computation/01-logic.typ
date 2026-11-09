#import "../../lib/ku.typ": ku

#ku(
  id: "ds.02.01.logic",
  title: "用逻辑说话",
  title_en: "Speaking with Logic",
  chapter: "02-logic-proof-computation",
  order: 1,
  prerequisites: ("ds.01.03.relations-functions",),
  related: ("ds.02.02.proof",),
  sources: (
    (book: "rosen", edition: 8, chapter: "1", section: "1.1-1.4"),
  ),
  labs: ("lab.logic-spec",),
  exercises: ("ex.ds.02.01",),
)[
  === 待写
  本知识点将在 Issue #16 中完成。写作时必须覆盖：

  - 问题动机：为什么自然语言描述会产生歧义？
  - 形式化定义：命题、谓词、量词、前置条件、后置条件。
  - 证明 / 推导：如何把规格写成逻辑公式。
  - 机制：从规格检查例子是否满足。
  - 实验设计：写前置 / 后置条件，自动检查输入输出。
  - 来源：Rosen 第 1 章。
  - 连接：1.3 的关系、2.2 的证明、2.3 的不变量。
  - 易错点：量词顺序、蕴含方向、空真。
]
