export class Metadata {
  brand = 'Unknown brand';
  modelFilename = '';
  price = 1.00;
  leftSlot: number[] = [0];
  rightSlot: number[] = [0];
  upperSlot: number[] = [0];

  constructor(data?: any) {
    if (data == null) { return; }

    if (data.brand) { this.brand = data.brand; }
    if (data.price != null && +data.price >= 0) { this.price = +data.price; }
    if (data.leftSlot != null && data.leftSlot.length > 0) {
      const input = data.leftSlot.map(val => +val);
      this.leftSlot = input;
      if (input.includes(0)) { this.leftSlot = [0]; }
      if (input.includes(-1)) { this.leftSlot = [-1]; }
    }
    if (data.rightSlot != null && data.rightSlot.length > 0) {
      const input = data.rightSlot.map(val => +val);
      this.rightSlot = input;
      if (input.includes(0)) { this.rightSlot = [0]; }
      if (input.includes(-1)) { this.rightSlot = [-1]; }
    }
    if (data.upperSlot != null && data.upperSlot.length > 0) {
      const input = data.upperSlot.map(val => +val);
      this.upperSlot = input;
      if (input.includes(0)) { this.upperSlot = [0]; }
      if (input.includes(-1)) { this.upperSlot = [-1]; }
    }
    if (data.modelFilename) { this.modelFilename = data.modelFilename; }
  }
}
