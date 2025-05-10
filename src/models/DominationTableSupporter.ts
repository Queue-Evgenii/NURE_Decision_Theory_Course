import type { Alternative } from "./Alternative";
import type { Criteria } from "./Criteria";
import { ComparisonValues } from "./enums/ComparisonValues";

export class DominationTableSupporter {

  constructor(private alternatives: ReadonlyArray<Alternative>, private criterias: ReadonlyArray<Criteria>) {}

  public initializeMatrix() {
    const matrix: number[][] = [];

    for (let i = 0; i < this.alternatives.length; i++) {
      const row: number[] = [];

      for (let j = 0; j < this.alternatives.length; j++) {
        if (i === j) {
          row.push(ComparisonValues.SAME);
        } else if (this.dominates(this.alternatives[i], this.alternatives[j])) {
          row.push(ComparisonValues.ROW_BETTER);
        } else {
          row.push(ComparisonValues.UNCOMPARABLE);
        }
      }

      matrix.push(row);
    }

    return matrix;
  }

  private getWeightForCriteria(alternative: Alternative, criteriaName: string) {
    const criteria = this.criterias.find(c => c.name === criteriaName);
    const variant = criteria?.variants.find(v => v.name === alternative[criteriaName]);
    return variant?.weight ?? 0;
  }

  private dominates(a: Alternative, b: Alternative): boolean {
    let better = false;

    for (const criteria of this.criterias) {
      const aWeight = this.getWeightForCriteria(a, criteria.name);
      const bWeight = this.getWeightForCriteria(b, criteria.name);

      if (aWeight > bWeight) {
        better = true;
      } else if (aWeight < bWeight) {
        return false;
      }
    }

    return better;
  }
}
