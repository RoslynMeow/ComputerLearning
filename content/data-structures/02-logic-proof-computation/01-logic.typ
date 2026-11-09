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
  === 问题动机
  “找最大值”这句话听起来很清楚，但它没有说：空数组怎么办？有多个最大值怎么办？
  自然语言有歧义，程序不能靠猜。逻辑的作用，是把要求写成没有歧义的公式。

  === 形式化定义
  *命题* 是能判断真假的陈述。用 $p, q$ 表示命题，基本联结词有：

  - 否定：$not p$；
  - 合取：$p and q$；
  - 析取：$p or q$；
  - 蕴含：$p -> q$；
  - 等价：$p <-> q$。

  真值表完全决定这些联结词的含义。例如 $p -> q$ 只有在 $p$ 真、$q$ 假时为假。

  *谓词* 是带变量的命题，例如 $P(x)$ 表示“$x$ 是偶数”。
  *量词* 把谓词变成命题：

  - $forall x in D, P(x)$ 表示“$D$ 中每个 $x$ 都满足 $P$”；
  - $exists x in D, P(x)$ 表示“$D$ 中至少有一个 $x$ 满足 $P$”。

  *规格* 用前置条件与后置条件描述一个操作：$"pre" -> "post"$。

  例如“在数组 $a[0..n)$ 中找最大值”可以写成：

  - 前置：$n > 0$；
  - 后置：$r >= a[i]$ 对所有 $0 <= i < n$ 成立，且存在某个 $i$ 使 $r = a[i]$。

  === 证明与推导
  *命题.* $not (forall x in D, P(x)) <-> exists x in D, not P(x)$。

  *证明.* 左边表示“并非所有 $x$ 都满足 $P$”，也就是“存在某个 $x$ 不满足 $P$”，
  这正是右边。反过来，若存在 $x$ 不满足 $P$，则不可能所有 $x$ 都满足 $P$。
  两个方向都成立，所以等价。$square$

  这条规律说明：否定一个全称命题，会得到一个存在命题。
  写规格时最常见的错误，就是忘记把量词一起翻转。

  === 机制
  把规格翻译成代码断言，是逻辑最直接的用途。例如：

  ```python
  def find_max(a):
      assert len(a) > 0              # pre
      r = a[0]
      for x in a[1:]:
          if x > r:
              r = x
      assert all(r >= x for x in a)  # post 1
      assert r in a                  # post 2
      return r
  ```

  量词顺序也很重要：

  - $forall x exists y, y > x$：对每个 $x$，都能找到更大的 $y$（在自然数中为真）。
  - $exists y forall x, y > x$：存在一个 $y$ 比所有 $x$ 都大（在自然数中为假）。

  同样的符号，换一个顺序，意思完全不同。

  === 实验
  Web 实验 `lab.logic-spec`：在有限论域上构造谓词与量词公式，
  实时显示真值；你可以扮演“证明者”和“反例寻找者”，
  看看 $forall$ 与 $exists$ 的顺序如何改变真假。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Sections 1.1-1.4.

  === 连接
  - 1.3 的关系与函数：谓词可以看成关系。
  - 2.2 的证明：证明就是把逻辑推导写清楚。
  - 2.3 的不变量：不变量就是一个必须始终为真的谓词。
  - 后面的算法规格、类型系统、数据库查询都建立在这套语言上。

  === 易错点
  - 蕴含方向反了：$p -> q$ 不等于 $q -> p$。
  - 空真：当前提为假时，$p -> q$ 自动为真。
  - 量词顺序：$forall exists$ 与 $exists forall$ 完全不同。
  - 否定量词忘记翻转：$not forall$ 变成 $exists not$，不是 $forall not$。

  === 练习
  动态练习 `ex.ds.02.01`：在随机有限论域上判断量词公式真假；
  给出公式的否定；找出使公式为假的反例。
]
