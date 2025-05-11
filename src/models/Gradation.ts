import type { Alternative } from "./Alternative";

export interface Gradation {
  alternative: Alternative,
  grade1: Array<number>,
  grade2: Array<number>,
}
