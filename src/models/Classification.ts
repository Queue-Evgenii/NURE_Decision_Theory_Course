import type { ClassifiedAlternative } from "./Alternative";

export interface ClassificationStepAlternative extends ClassifiedAlternative {
  distanceToGood: number;
  distanceToBad: number;
  closenessToGood: number;
  closenessToBad: number;
  amountBetter: number;
  amountWorse: number;
  informativenessForGood: number;
  informativenessForBad: number;
  informativeness: number;
}

export interface ClassificationStep {
  iteration: number;
  alternatives: ReadonlyArray<ClassificationStepAlternative> | Array<ClassificationStepAlternative>
}

export class Classification {
  steps: Array<ClassificationStep> = [];
}
