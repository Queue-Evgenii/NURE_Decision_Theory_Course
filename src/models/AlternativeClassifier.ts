import { Alternative } from "./Alternative";
import { Criteria } from "./Criteria";

export const classifyAlternatives = (
  alternatives: ReadonlyArray<Alternative>,
  selectedAlternative: Alternative,
  criterias: Criteria[]
) => {
  const betterAlternatives: Alternative[] = [];
  const worseAlternatives: Alternative[] = [];
  const incomparableAlternatives: Alternative[] = [];

  for (const alternative of alternatives) {
    if (Alternative.isEqual(alternative, selectedAlternative)) continue; // Пропускаем саму себя

    let isBetter = true;
    let isWorse = true;

    for (const criteria of criterias) {
      const selectedVariant = selectedAlternative[criteria.name] as string;
      const alternativeVariant = alternative[criteria.name] as string;

      const selectedWeight = criteria.getWeight(selectedVariant);
      const alternativeWeight = criteria.getWeight(alternativeVariant);

      if (selectedWeight < alternativeWeight) {
        isWorse = false;
      }
      if (selectedWeight > alternativeWeight) {
        isBetter = false;
      }
    }

    if (isBetter) {
      betterAlternatives.push(alternative);
    } else if (isWorse) {
      worseAlternatives.push(alternative);
    } else {
      incomparableAlternatives.push(alternative);
    }
  }

  return { betterAlternatives, worseAlternatives, incomparableAlternatives }
}

export class AlternativeClassifier {
  private _betterAlternatives: Alternative[] = [];
  private _worseAlternatives: Alternative[] = [];
  private _incomparableAlternatives: Alternative[] = [];

  constructor(
    alternatives: ReadonlyArray<Alternative>,
    selectedAlternative: Alternative,
    criterias: Criteria[]
  ) {
    const {
      betterAlternatives,
      worseAlternatives,
      incomparableAlternatives
    } = classifyAlternatives(
      alternatives,
      selectedAlternative,
      criterias
    );
    this._betterAlternatives = betterAlternatives;
    this._worseAlternatives = worseAlternatives;
    this._incomparableAlternatives = incomparableAlternatives;
  }

  public getBetterAlternatives(): Alternative[] {
    return this._betterAlternatives;
  }

  public getWorseAlternatives(): Alternative[] {
    return this._worseAlternatives;
  }

  public getIncomparableAlternatives(): Alternative[] {
    return this._incomparableAlternatives;
  }

  public getTotalAlternatives(): number {
    return this._betterAlternatives.length + this._worseAlternatives.length + this._incomparableAlternatives.length + 1;
  }
}
