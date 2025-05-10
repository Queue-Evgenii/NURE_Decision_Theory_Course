import type { Variant } from "./Variant";

export class Criteria {
  private _name: string;
  private _variants: Variant[];

  constructor(name: string, variants: Variant[]) {
    this._name = name;
    this._variants = variants;
  }

  public get name(): string {
    return this._name;
  }

  public get variants(): Variant[] {
    return this._variants;
  }

  public getWeight(variantName: string): number {
    const variant = this._variants.find(v => v.name === variantName);
    return variant ? variant.weight : 0;
  }
}
