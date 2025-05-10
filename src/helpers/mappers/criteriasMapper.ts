import { Criteria } from "@/models/Criteria";
import { Variant } from "@/models/Variant";

export const criteriasMapper = (rawData: Array<Criteria>): Array<Criteria> => {
  return rawData.map(
    (criteria: Criteria) => new Criteria(
      criteria.name,
      criteria.variants.map(variant => new Variant(variant.name, variant.weight))
    )
  )
}
