export type GraphSource = {
  book: string;
  edition?: number | null;
  chapter?: string;
  section?: string;
};

export type GraphNode = {
  id: string;
  title: string;
  title_en?: string | null;
  subject: string;
  subjectTitle: string;
  chapter: string;
  chapterTitle: string;
  order: number;
  prerequisites: string[];
  related: string[];
  sources: GraphSource[];
  labs: string[];
  exercises: string[];
};

export type GraphEdge = {
  from: string;
  to: string;
  kind: "prerequisite" | "related";
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type Book = {
  id: string;
  title: string;
  author: string[];
  edition?: number | null;
  date?: number | null;
  publisher?: string | null;
  url?: string | null;
};
