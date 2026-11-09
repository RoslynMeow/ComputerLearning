#import "../lib/theme.typ": conf

#show: conf.with(
  title: [数据结构与算法],
  subtitle: [Data Structures & Algorithms],
  author: [MS Roslyn],
  date: datetime.today().display("[year] 年 [month] 月 [day] 日"),
  abstract: [
    本教程从数学语言出发，先建立描述世界、定义问题、证明正确与分析代价的工具，
    再进入线性结构、树、图与算法设计。每个知识点都标注教材来源，
    并配有可交互实验，让读者能看见“为什么这样做”以及“改一个参数会怎样”。
  ],
)

#include "01-computation-and-world/chapter.typ"
