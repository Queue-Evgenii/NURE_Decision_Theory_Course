export class ArithmeticMean {
  /**
  * Gets the Cartesian product of arrays.
  * Each array in the array must be an array of elements of the same type.
  *
  * @param arrays - An array of arrays to get the Cartesian product for.
  * @returns An array of all possible combinations.
  */
  public getCartesianProduct<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
      (acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])),
      [[]]
    );
  }
}
