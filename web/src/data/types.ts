export type ContentHeading = {
  id: string;
  text: string;
  level: number;
};

export type ContentKu = {
  id: string;
  title: string;
  title_en?: string | null;
  chapter: string;
  chapterTitle: string;
  order: number;
  file: string;
  toc?: ContentHeading[];
};

export type SubjectContent = {
  subject: string;
  title: string;
  pdf: string;
  kus: ContentKu[];
};

export type ContentManifest = {
  subject: string;
  title: string;
  index: string;
};
