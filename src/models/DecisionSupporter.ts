import { Alternative } from "./Alternative";
import { type DecisionSupport } from "./DecisionSupport";

export class DecisionSupporter implements DecisionSupport {
  private readonly _alternatives: ReadonlyArray<Alternative>;
  private _bestAlternative!: Alternative;
  private _worstAlternative!: Alternative;

  constructor(alternatives: ReadonlyArray<Alternative>) {
    this._alternatives = alternatives;

    this._bestAlternative = this._alternatives[0];
    this._worstAlternative = this._alternatives[this._alternatives.length - 1];
  }

  public getAlternativesAmount(): number {
    return this._alternatives.length;
  }

  public getBestAlternative(): Alternative {
    return this._bestAlternative;
  }

  public getWorstAlternative(): Alternative {
    return this._worstAlternative;
  }
}
