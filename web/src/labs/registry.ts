import { adtRepresentationLab } from "./ds01/adtRepresentation";
import { computerRepresentationLab } from "./ds01/computerRepresentation";
import { countingPositionalLab } from "./ds01/countingPositional";
import { elementsSetsLab } from "./ds01/elementsSets";
import { integersTwosComplementLab } from "./ds01/integersTwosComplement";
import { naturalNumbersLab } from "./ds01/naturalNumbers";
import { relationsFunctionsLab } from "./ds01/relationsFunctions";
import { setOperationsLab } from "./ds01/setOperations";
import type { Lab } from "./types";

export const labs: Lab[] = [
  elementsSetsLab,
  setOperationsLab,
  relationsFunctionsLab,
  naturalNumbersLab,
  countingPositionalLab,
  integersTwosComplementLab,
  computerRepresentationLab,
  adtRepresentationLab,
];

export const labsByKu: Record<string, Lab[]> = {};

for (const lab of labs) {
  labsByKu[lab.ku] ??= [];
  labsByKu[lab.ku].push(lab);
}

export function getLabsForKu(ku: string): Lab[] {
  return labsByKu[ku] ?? [];
}
