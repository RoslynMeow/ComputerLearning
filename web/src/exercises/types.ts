export type RNG = () => number;

export type ExerciseKind = "text" | "number" | "set" | "bitvector" | "choice";

export type ExerciseInstance = {
  kind: ExerciseKind;
  prompt: string;
  answer: string;
  steps: string[];
  placeholder?: string;
  choices?: string[];
};

export type Exercise = {
  id: string;
  ku: string;
  title: string;
  generate: (rng: RNG) => ExerciseInstance;
  check: (input: string, instance: ExerciseInstance) => boolean;
};
