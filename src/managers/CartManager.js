import fs from 'fs';

export default class CartManager {
  constructor(path = 'carts.json') {
    this.path = path;
    this.carts = [];
    if (fs.existsSync(this.path)) {
      this.carts = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
    }
  }

  // Crear carrito vacío
  async createCart() {
    const newCart = {
      id: this.carts.length + 1,
      products: []
    };
    this.carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
    return newCart;
  }

  // Obtener carrito por ID
  async getById(cid) {
    return this.carts.find(c => c.id == cid);
  }

  // Agregar producto al carrito
  async addProduct(cid, pid, quantity = 1) {
    const cart = await this.getById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const prodIndex = cart.products.findIndex(p => p.product == pid);
    if (prodIndex > -1) {
      cart.products[prodIndex].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
    return cart;
  }
}