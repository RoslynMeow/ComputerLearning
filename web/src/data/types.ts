export type KuIndexEntry = {
  id: string;
  title: string;
  page: number;
};

export type SubjectIndex = {
  subject: string;
  title: string;
  pdf: string;
  kus: KuIndexEntry[];
};

export type SubjectManifest = {
  subject: string;
  title: string;
  pdf: string;
  index: string;
};
