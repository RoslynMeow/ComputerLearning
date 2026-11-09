#import "../lib/theme.typ": conf

#show: conf.with(
  title: [数据结构与算法],
  subtitle: [Data Structures & Algorithms],
  author: [MS Roslyn],
  date: datetime.today().display("[year] 年 [month] 月 [day] 日"),
  abstract: [
    本教程从元素与集合出发，先建立数字与计算机表示的基础，
    再进入逻辑、证明、计算与数据结构。每个知识点都标注教材来源，
    并配有可交互实验与动态练习，让读者能看见“为什么这样做”以及“改一个参数会怎样”。
  ],
)

#include "01-elements-to-integers/chapter.typ"
#include "02-logic-proof-computation/chapter.typ"
