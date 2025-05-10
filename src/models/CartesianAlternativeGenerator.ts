import { CartesianFactory } from "../helpers/math/CartesianFactory";
import { Alternative } from "./Alternative";
import { type AlternativeGenerator } from "./AlternativeGenerator";
import { Criteria } from "./Criteria";

export class CartesianAlternativeGenerator implements AlternativeGenerator {
  public generateAlternatives(criterias: Criteria[]): ReadonlyArray<Alternative> {
    const factory = new CartesianFactory();
    const variantsArrays = criterias.map(c =>
      c.variants
        .sort((a, b) => b.weight - a.weight)
        .map(v => v.name)
    );

    const combinations = factory.getCartesianProduct(variantsArrays);
    return combinations.map(combination => {
      const combinationObject: Alternative = {};
      criterias.forEach((criteria, index) => {
        combinationObject[criteria.name] = combination[index];
      });
      return combinationObject;
    });
  }
}
