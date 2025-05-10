export class Alternative {
  [key: string]: string | number;

  public static isEqual(a1: Alternative, a2: Alternative) {
    const keys1 = Object.keys(a1);
    const keys2 = Object.keys(a2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!(key in a2)) return false;
      if (a1[key] !== a2[key]) return false;
    }

    return true;
  }
};

export class NAlternative {
  [key: string]: number;
};

export class ClassifiedAlternative {
  alternative!: Alternative;
  grade: number | Array<number> = 0;
}
