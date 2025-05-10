import { Alternative, type ClassifiedAlternative } from "./Alternative";
import { classifyAlternatives } from "./AlternativeClassifier";
import  { Classification, type ClassificationStep, type ClassificationStepAlternative } from "./Classification";
import type { Criteria } from "./Criteria";

export class OrdinalClassifier {
  private classification = new Classification();
  private centerGood!: Alternative;
  private centerBad!: Alternative;

  constructor() {}

  public classify(
    alternatives: Array<ClassifiedAlternative>,
    criterias: Array<Criteria>,
    grades: ReadonlyArray<number>
  ): Classification {
    let iteration = 0;

    while (true) {
      if (grades[iteration] === undefined) {
        this.classification.steps.push({iteration: iteration, alternatives: alternatives as Array<ClassificationStepAlternative>});
        return this.classification;
      };
      this.centerGood = this.classifiedAlternativeAverageMean(alternatives, 1);
      this.centerBad = this.classifiedAlternativeAverageMean(alternatives, 2);

      let maxDistance = 0;
      const defaultAlternatives = alternatives.filter(e => Array.isArray(e.grade)).map(e => ({...e.alternative}))
      let cAlternatives: ReadonlyArray<ClassificationStepAlternative> = alternatives.map(e => {
        const distanceToGood = this.getDistanceToGood(e.alternative);
        const distanceToBad = this.getDistanceToBad(e.alternative);

        if (maxDistance < distanceToGood) maxDistance = distanceToGood;
        if (maxDistance < distanceToBad) maxDistance = distanceToBad;

        const { betterAlternatives, worseAlternatives } = classifyAlternatives(defaultAlternatives, e.alternative, criterias);
        return {
          ...e,
          distanceToGood,
          distanceToBad,
          amountBetter: Array.isArray(e.grade) ? betterAlternatives.length : 0,
          amountWorse: Array.isArray(e.grade) ? worseAlternatives.length : 0,
          closenessToGood: 0,
          closenessToBad: 0,
          informativenessForGood: 0,
          informativenessForBad: 0,
          informativeness: 0,
        };
      });

      cAlternatives = cAlternatives.map(e => {
        const closenessToGood = e.grade === 1 ? 1 : e.grade === 2 ? 0 : this.getClosenessToGood(maxDistance, e.distanceToGood, e.distanceToBad)
        const informativenessForGood = e.amountBetter * closenessToGood;
        const informativenessForBad = e.amountWorse * (1 - closenessToGood);
        return {
          ...e,
          closenessToGood: closenessToGood,
          closenessToBad: 1 - closenessToGood,
          informativenessForGood,
          informativenessForBad,
          informativeness: informativenessForGood + informativenessForBad,
        };
      })
      const step: ClassificationStep = {
        iteration: iteration,
        alternatives: cAlternatives,
      }

      this.classification.steps.push(step);

      const alternative = step.alternatives.filter(e => Array.isArray(e.grade)).reduce((max, curr) =>
        curr.informativeness > max.informativeness ? curr : max
      );
      const { betterAlternatives, worseAlternatives } = classifyAlternatives(defaultAlternatives, alternative.alternative, criterias);

      if (grades[iteration] === 1) {
        for (let i = 0; i < alternatives.length; ++i) {
          if (Alternative.isEqual(alternative.alternative, alternatives[i].alternative)) {
            alternatives[i].grade = 1;
            continue;
          }
          betterAlternatives.forEach(e => {
            if (Alternative.isEqual(e, alternatives[i].alternative)) {
              alternatives[i].grade = 1;
            }
          })
        }
      }


      if (grades[iteration] === 2) {
        for (let i = 0; i < alternatives.length; ++i) {
          if (Alternative.isEqual(alternative.alternative, alternatives[i].alternative)) {
            alternatives[i].grade = 2;
            continue;
          }
          worseAlternatives.forEach(e => {
            if (Alternative.isEqual(e, alternatives[i].alternative)) {
              alternatives[i].grade = 2;
            }
          })
        }
      }

      iteration++;

      let isContinue = false;
      for (let i = 0; i < alternatives.length; ++i) {
        if (Array.isArray(alternatives[i].grade)) {
          isContinue = true;
        }
      }
      if (isContinue === false) {
        this.classification.steps.push({iteration: iteration, alternatives: alternatives as Array<ClassificationStepAlternative>});
        return this.classification;
      }
    }
  }

  private getClosenessToGood = (maxDistance: number, distanceToGood: number, distanceToBad: number) => {
    const result = (maxDistance - distanceToGood) / ((maxDistance - distanceToGood) + (maxDistance - distanceToBad));
    return result;
  }

  private getClosenessToBad = (maxDistance: number, distanceToGood: number, distanceToBad: number) => {
    return (maxDistance - distanceToBad) / ((maxDistance - distanceToGood) + (maxDistance - distanceToBad))
  }

  private classifiedAlternativeAverageMean = (alternatives: ReadonlyArray<ClassifiedAlternative>, grade: number) => {
    const a = alternatives.filter(e => e.grade === grade);

    const result: Alternative = { };

    for (const obj of a) {
      for (const key in obj.alternative) {
        const value = obj.alternative[key];
        if (typeof value === "number") {
          if (!(key in result)) {
            result[key] = 0;
          }
          (result[key] as number) += value;
        }
      }
    }

    for (const key in result) {
      (result[key] as number) /= a.length;
    }

    return { ...result };
  }

  private getDistanceToGood = (alternative: Alternative) => {
    let result = 0;

    for (const key in alternative) {
      result += Math.abs((this.centerGood[key] as number) - (alternative[key] as number));
    }

    return result;
  }

  private getDistanceToBad = (alternative: Alternative) => {
    let result = 0;

    for (const key in alternative) {
      result += Math.abs((this.centerBad[key] as number) - (alternative[key] as number));
    }

    return result;
  }
}
