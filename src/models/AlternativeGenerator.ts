import { Alternative } from "./Alternative";
import { Criteria } from "./Criteria";

export interface AlternativeGenerator {
  generateAlternatives(criterias: Criteria[]): ReadonlyArray<Alternative>;
}
