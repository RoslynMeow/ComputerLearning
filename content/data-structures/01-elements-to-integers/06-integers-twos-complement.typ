#import "../../lib/ku.typ": ku

#ku(
  id: "ds.01.06.integers-twos-complement",
  title: "整数：从自然数对到补码",
  title_en: "Integers: From Pairs of Naturals to Two's Complement",
  chapter: "01-elements-to-integers",
  order: 6,
  prerequisites: ("ds.01.04.natural-numbers", "ds.01.05.counting-positional"),
  related: ("ds.01.07.computer-representation", "ds.01.08.abstract-representation"),
  sources: (
    (book: "rosen", edition: 8, chapter: "4", section: "4.1"),
    (book: "csapp", edition: 3, chapter: "2", section: "2.2-2.3"),
    (book: "cod", edition: 5, chapter: "2"),
  ),
  labs: ("lab.integers-twos-complement",),
  exercises: ("ex.ds.01.06",),
)[
  === 问题动机
  自然数只能表示“有多少”，不能表示“欠多少”。$3 - 5$ 在自然数里没有答案。
  整数就是为了让减法永远有解而构造出来的。

  === 形式化定义
  从数学上，整数可以由自然数对构造。考虑所有有序对 $(a,b) in NN times NN$，
  定义等价关系

  $ (a,b) tilde (c,d) <-> a + d = b + c $。

  直观上，$(a,b)$ 代表 $a - b$。例如 $(5,3)$、$(2,0)$、$(6,4)$ 都代表同一个整数 $2$；
  $(3,5)$ 代表 $-2$。整数集 $ZZ$ 就是这些等价类的集合。

  在这个定义下，加法与乘法可以良定义地写成

  $ [(a,b)] + [(c,d)] = [(a+c, b+d)], quad [(a,b)] dot [(c,d)] = [(a c + b d, a d + b c)] $。

  === 证明与推导
  *命题.* 上面的加法不依赖于代表元的选择。

  *证明.* 若 $(a,b) tilde (a',b')$ 且 $(c,d) tilde (c',d')$，则
  $a + b' = b + a'$，$c + d' = d + c'$。
  两式相加得 $(a+c) + (b'+d') = (b+d) + (a'+c')$，
  所以 $(a+c, b+d) tilde (a'+c', b'+d')$。$square$

  这说明：定义在等价类上的运算，必须先证明它与代表元无关。

  === 机制
  计算机用固定 $n$ 位表示整数。常见方案有三种：

  - 符号-数值：最高位符号，其余位数值；有 $+0$ 与 $-0$。
  - 反码：负数按位取反；仍有 $+0$ 与 $-0$。
  - 补码：负数等于按位取反再加一，即 $-x = tilde x + 1 space (mod 2^n)$。

  补码把加法统一成模 $2^n$ 的加法。以 $4$ 位为例：

  $ 5 = 0101, quad -5 = 1011, quad 5 + (-5) = 1 0000 -> 0000 $。

  最高位的进位被丢弃，结果正好是 $0$。$n$ 位补码的范围是
  $-2^(n-1)$ 到 $2^(n-1) - 1$。

  === 实验
  Web 实验 `lab.integers-twos-complement`：切换 $n = 4, 8, 16$，
  输入十进制整数，观察符号-数值、反码、补码三种表示；
  再做加法，单步显示进位与溢出。

  === 来源
  - Rosen, *Discrete Mathematics and Its Applications*, 8th ed., Section 4.1.
  - Bryant & O'Hallaron, *Computer Systems: A Programmer's Perspective*, 3rd ed., Sections 2.2-2.3.
  - Patterson & Hennessy, *Computer Organization and Design*, 5th ed., Chapter 2.

  === 连接
  - 1.4 的自然数。
  - 1.5 的位置记数法。
  - 1.7 的位、字节与内存表示。
  - 后面的哈希、位图、溢出检查都会用到补码。

  === 易错点
  - 补码的“取反加一”是对固定位数取模，不是对无限整数取反。
  - $n$ 位补码的最小值是 $-2^(n-1)$，不是 $-2^(n-1)+1$。
  - 有符号溢出不是“最高位进位”，而是“进位与次高位进位不同”。

  === 练习
  动态练习 `ex.ds.01.06`：随机生成位宽与整数，要求写出补码；
  或给出两个补码数，判断加法结果与是否溢出。
]
