export class Variant {
  private _name: string;
  private _weight: number;

  constructor(name: string, weight: number) {
    this._name = name;
    this._weight = weight;
  }

  
  public get name() : string {
    return this._name;
  }
  
  public get weight() : number {
    return this._weight;
  }
}