#let ku(
  id: "",
  title: "",
  title_en: none,
  chapter: "",
  order: 0,
  prerequisites: (),
  related: (),
  sources: (),
  labs: (),
  exercises: (),
  body,
) = {
  [#metadata((
    kind: "ku",
    id: id,
    title: title,
    title_en: title_en,
    chapter: chapter,
    order: order,
    prerequisites: prerequisites,
    related: related,
    sources: sources,
    labs: labs,
    exercises: exercises,
  )) <ku>]

  let suffix = if title_en != none and title_en != "" {
    [ (#title_en)]
  } else {
    []
  }

  heading(level: 2, [#title#suffix])
  body
}

#let ku-notes(
  id: "",
  title: "",
  body,
) = {
  show heading.where(level: 3): it => {
    set text(size: 9pt, weight: "bold")
    it.body
  }

  block(
    width: 100%,
    breakable: true,
    above: 0.8em,
    below: 0.8em,
    inset: (x: 0.8em, y: 0.6em),
    stroke: (left: 0.8pt + rgb("#b9ae9c")),
  )[
    #text(size: 10pt, weight: "bold")[#title]
    #h(0.5em)
    #text(size: 8pt, fill: rgb("#8a8172"))[#id]
    #v(0.3em)
    #set text(size: 9pt)
    #body
  ]
}

#let ku-notes-title(title: "") = {
  pagebreak(weak: true)
  align(center)[
    #text(
      size: 18pt,
      weight: "bold",
      font: ("New Computer Modern", "SimHei"),
    )[#title]
    #v(0.5em)
    #text(size: 10pt, fill: rgb("#777"))[实验 · 来源 · 连接 · 易错点 · 练习]
  ]
  v(0.8em)
}
