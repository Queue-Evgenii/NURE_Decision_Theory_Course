export class DominationTable {
  private static _id = 0;
  public id!: number;
  public isCurrent = true;
  public matrix: Array<Array<number>> = [];

  constructor(matrix: Array<Array<number>>) {
    this.setId();
    this.matrix = JSON.parse(JSON.stringify(matrix));
  }

  private setId(): void {
    this.id = DominationTable._id;
    DominationTable._id++;
  }
}
