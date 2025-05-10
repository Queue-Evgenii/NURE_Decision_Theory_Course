import { Alternative } from "./Alternative";

export interface DecisionSupport {
  getAlternativesAmount(): number;

  getBestAlternative(): Alternative;

  getWorstAlternative(): Alternative;
}
