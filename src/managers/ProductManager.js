import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, '../../data/products.json');

const ALLOWED_SIZES = ['XS','S','M','L','XL','XXL'];

export default class ProductManager {
  async #readFile() {
    try {
      const data = await fs.readFile(DATA_PATH, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await this.#writeFile([]);
        return [];
      }
      throw err;
    }
  }

  async #writeFile(data) {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAll() {
    return await this.#readFile();
  }

  async getById(id) {
    const list = await this.#readFile();
    return list.find(p => p.id === id) || null;
  }

  #validateCreate(payload) {
    const required = ['title','description','code','price','status','stock','category','size','color'];
    const missing = required.filter(k => payload[k] === undefined);
    if (missing.length) {
      const error = new Error(`Faltan campos requeridos: ${missing.join(', ')}`);
      error.status = 400;
      throw error;
    }
    if (typeof payload.title !== 'string' || !payload.title.trim()) {
      const e = new Error('title debe ser string no vacío'); e.status = 400; throw e;
    }
    if (typeof payload.description !== 'string') {
      const e = new Error('description debe ser string'); e.status = 400; throw e;
    }
    if (typeof payload.code !== 'string' || !payload.code.trim()) {
      const e = new Error('code debe ser string no vacío'); e.status = 400; throw e;
    }
    if (isNaN(Number(payload.price))) {
      const e = new Error('price debe ser numérico'); e.status = 400; throw e;
    }
    if (typeof payload.status !== 'boolean') {
      const e = new Error('status debe ser boolean'); e.status = 400; throw e;
    }
    if (!Number.isInteger(Number(payload.stock))) {
      const e = new Error('stock debe ser entero'); e.status = 400; throw e;
    }
    if (typeof payload.category !== 'string' || !payload.category.trim()) {
      const e = new Error('category debe ser string no vacío'); e.status = 400; throw e;
    }
    if (typeof payload.size !== 'string' || !payload.size.trim()) {
      const e = new Error('size debe ser string'); e.status = 400; throw e;
    }
    if (!ALLOWED_SIZES.includes(payload.size.toUpperCase())) {
      const e = new Error(`size inválido. Permitidos: ${ALLOWED_SIZES.join(', ')}`); e.status = 400; throw e;
    }
    if (typeof payload.color !== 'string' || !payload.color.trim()) {
      const e = new Error('color debe ser string'); e.status = 400; throw e;
    }
  }

  async create(payload) {
    this.#validateCreate(payload);
    const list = await this.#readFile();

    const dupCode = list.find(p => p.code === payload.code);
    if (dupCode) {
      const error = new Error('El código de producto ya existe');
      error.status = 400;
      throw error;
    }

    const newProduct = {
      id: crypto.randomUUID(),
      title: String(payload.title),
      description: String(payload.description),
      code: String(payload.code),
      price: Number(payload.price),
      status: Boolean(payload.status),
      stock: Number(payload.stock),
      category: String(payload.category),
      size: String(payload.size).toUpperCase(),
      color: String(payload.color).toLowerCase(),
    };

    list.push(newProduct);
    await this.#writeFile(list);
    return newProduct;
  }

  async update(id, changes) {
    if ('id' in changes) {
      const error = new Error('No se permite actualizar el id');
      error.status = 400;
      throw error;
    }

    const list = await this.#readFile();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }

    const current = list[idx];
    const merged = { ...current, ...changes };

    // Validaciones parciales
    if ('size' in changes) {
      const size = String(merged.size).toUpperCase();
      if (!['XS','S','M','L','XL','XXL'].includes(size)) {
        const e = new Error('size inválido'); e.status = 400; throw e;
      }
      merged.size = size;
    }
    if ('color' in changes) {
      merged.color = String(merged.color).toLowerCase();
    }

    list[idx] = merged;
    await this.#writeFile(list);
    return merged;
  }

  async delete(id) {
    const list = await this.#readFile();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }
    const [removed] = list.splice(idx, 1);
    await this.#writeFile(list);
    return removed;
  }
}