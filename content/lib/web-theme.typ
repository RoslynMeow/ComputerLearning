#let web-conf(body) = {
  set text(
    font: ("Noto Serif CJK SC", "SimSun", "Microsoft YaHei"),
    size: 12pt,
    lang: "zh",
    region: "cn",
  )
  set heading(numbering: "1.1")
  set par(justify: true, leading: 0.75em)
  set math.equation(numbering: none)
  body
}
