export class Metadata {
  brand: string = 'Unknown brand';
  modelFilename: string = '';
  price: number = 1.00;
  leftSlot: number = 0;
  rightSlot: number = 0;
  upperSlot: number = 0;

  constructor(data?: any) {
    if (data == null) return;

    if (data.brand) this.brand = data.brand;
    if (data.price != null && +data.price >= 0) this.price = +data.price;
    if (data.leftSlot != null && +data.leftSlot >= -1) this.leftSlot = +data.leftSlot;
    if (data.rightSlot != null && +data.rightSlot >= -1) this.rightSlot = +data.rightSlot;
    if (data.upperSlot != null && +data.upperSlot >= -1) this.upperSlot = +data.upperSlot;
    if (data.modelFilename) this.modelFilename = data.modelFilename;
  }
}
