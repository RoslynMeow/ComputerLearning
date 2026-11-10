export type LabParameter =
  | {
      kind: "number";
      name: string;
      label: string;
      min: number;
      max: number;
      step?: number;
      default: number;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      options: { label: string; value: string | number }[];
      default: string | number;
    };

export type LabMetric = {
  label: string;
  value: string;
};

export type LabTraceRow = {
  step: number | string;
  state: string;
  note?: string;
};

export type LabResult = {
  summary: string;
  metrics?: LabMetric[];
  trace?: LabTraceRow[];
  steps?: string[];
};

export type LabParams = Record<string, string | number>;

export type Lab = {
  id: string;
  ku: string;
  title: string;
  description: string;
  parameters: LabParameter[];
  custom?: "set-builder" | "set-operations" | "relation-matrix";
  run: (params: LabParams) => LabResult;
};
