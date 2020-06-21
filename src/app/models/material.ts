export class Material {
  textureFilename = '';
  price = 1.00;

  constructor(data?: any) {
    if (data == null) { return; }
    if (data.price != null && +data.price >= 0) { this.price = +data.price; }
    if (data.textureFilename) { this.textureFilename = data.textureFilename; }
  }
}
