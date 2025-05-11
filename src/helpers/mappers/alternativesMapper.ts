import { Alternative } from "@/models/Alternative"

export const alternativesMapper = (rawData: Array<Alternative>): Array<Alternative> => {
  return rawData.map(
    (rawAlt: Alternative) => {
       const alt = new Alternative;
       Object.keys(rawAlt).forEach(k => {
        alt[k] = rawAlt[k];
       });
       return alt;
    }
  )
}
