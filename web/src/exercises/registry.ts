import { countingPositional } from "./ds01/countingPositional";
import { elementsSets } from "./ds01/elementsSets";
import { integersTwosComplement } from "./ds01/integersTwosComplement";
import { naturalNumbers } from "./ds01/naturalNumbers";
import { relationsFunctions } from "./ds01/relationsFunctions";
import { setOperations } from "./ds01/setOperations";
import type { Exercise } from "./types";

export const exercises: Exercise[] = [
  elementsSets,
  setOperations,
  relationsFunctions,
  naturalNumbers,
  countingPositional,
  integersTwosComplement,
];

export const exercisesByKu: Record<string, Exercise[]> = {};

for (const exercise of exercises) {
  exercisesByKu[exercise.ku] ??= [];
  exercisesByKu[exercise.ku].push(exercise);
}

export function getExercisesForKu(ku: string): Exercise[] {
  return exercisesByKu[ku] ?? [];
}
