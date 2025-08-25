import { Router } from 'express';
import CartManager from '../managers/CartManager.js';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const cm = new CartManager('carts.json'); 
const pm = new ProductManager('products.json'); 

// Crear carrito vacío
router.post('/', async (req, res) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carrito', detail: err.message });
  }
});

// Ver productos de un carrito
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cm.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carrito', detail: err.message });
  }
});

// Agregar producto a carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const product = await pm.getById(pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const cart = await cm.addProduct(cid, pid, 1);
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al agregar producto al carrito' });
  }
});

export default router;