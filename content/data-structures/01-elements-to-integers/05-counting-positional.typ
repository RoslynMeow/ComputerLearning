#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.05.counting-positional",
  title: "计数与位置记数法",
  title_en: "Counting and Positional Numeral Systems",
  chapter: "01-elements-to-integers",
  order: 5,
  prerequisites: ("ds.01.04.natural-numbers",),
  related: ("ds.01.06.integers-twos-complement", "ds.01.07.computer-representation"),
  sources: (
    (book: "rosen", edition: 8, chapter: "4", section: "4.1-4.2"),
    (book: "clrs", edition: 4, chapter: "1"),
  ),
  labs: ("lab.counting-positional",),
  exercises: ("ex.ds.01.05",),
)[
  === 问题动机
  “数数”看起来是本能，但计算机只会处理有限符号。要把一个数写下来，
  我们必须约定：用哪些符号、每个符号在什么位置、位置代表多大的权。

  === 形式化定义
  计数本质上是一个双射：把集合 $S$ 的元素与 ${0, 1, dots, n-1}$ 一一对应。
  如果存在这样的双射，就说 $S$ 有 $n$ 个元素，记作 $|S| = n$。

  位置记数法由三部分组成：

  + 基数 $b > 1$；
  + 数码集 $S_b = {0, 1, dots, b-1}$；
  + 数码序列 $d_k d_{k-1} dots d_0$，其中 $d_i in S_b$。

  它的值是

  $ y = sum_(i=0)^k d_i b^i $

  例如 $b = 2$，$(1011)_2 = 1 dot 2^3 + 0 dot 2^2 + 1 dot 2^1 + 1 dot 2^0 = 11$。

  反过来，把 $11$ 转成二进制：
  $ 11 = 5 dot 2 + 1, quad 5 = 2 dot 2 + 1, quad 2 = 1 dot 2 + 0, quad 1 = 0 dot 2 + 1 $
  从下往上读余数，得到 $1011$。

  === 证明与推导
  *命题.* 在禁止前导零的约定下，每个自然数都有唯一的 $b$ 进制表示。

  *证明思路.* 对 $y$ 做带余除法：
  $y = q b + r$，其中 $0 <= r < b$。
  最低位就是 $r$，剩下的问题是表示 $q$。对 $q$ 重复同样的步骤，
  直到 $q = 0$。每一步的余数由 $y$ 唯一决定，所以表示唯一。$square$

  这正是“除基取余”算法的数学依据。

  常用进制对照：

  #table(
    columns: 4,
    align: center,
    [十进制], [二进制], [八进制], [十六进制],
    [0], [0], [0], [0],
    [1], [1], [1], [1],
    [2], [10], [2], [2],
    [3], [11], [3], [3],
    [4], [100], [4], [4],
    [5], [101], [5], [5],
    [6], [110], [6], [6],
    [7], [111], [7], [7],
    [8], [1000], [10], [8],
    [10], [1010], [12], [A],
    [15], [1111], [17], [F],
  )

  === 机制
  整数部分：反复除以 $b$，余数从低位到高位产生。
  小数部分：反复乘以 $b$，整数部分从高位到低位产生。

  设两个数分别为 $d_k dots d_0$ 与 $e_k dots e_0$，结果为 $r_k dots r_0$，
  $c_i$ 是第 $i$ 位进位。后继与加法都是逐位进行的：

  $ s_i = d_i + e_i + c_i, quad r_i = s_i mod b, quad c_(i+1) = floor(s_i / b) $

  其中 $c_i$ 是进位。二进制加法就是 $b = 2$ 的特例。

]
