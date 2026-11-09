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
  )) <ku>]

  let suffix = if title_en != none and title_en != "" {
    [ (#title_en)]
  } else {
    []
  }

  heading(level: 2, [#title#suffix])
  body
}
