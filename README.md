# E-commerce de Ropa Femenina — Entrega N°1 (Node + Express)

API REST de **productos y carritos** para un e-commerce de **ropa femenina**.
- Persistencia en archivos: `./data/products.json` y `./data/carts.json`
- Puerto: **8080**
- Endpoints:
  - `/api/products`
  - `/api/carts`

## Modelo de Producto (Ropa Femenina)
Campos:
- `id` (autogenerado, string UUID)
- `title` (string) — Ej: "Vestido Floral"
- `description` (string)
- `code` (string único)
- `price` (number)
- `status` (boolean)
- `stock` (number)
- `category` (string) — Ej: "vestidos", "remeras", "pantalones", "blusas", "faldas", "accesorios"
- `size` (string) — Ej: "XS","S","M","L","XL","XXL"
- `color` (string) — Ej: "negro","blanco","rojo","azul"

> `id` **no se envía** en el body (se autogenera) y **no se puede actualizar** vía `PUT`.

## Rutas de Productos
- `GET /api/products/` — Lista todos los productos
- `GET /api/products/:pid` — Producto por id
- `POST /api/products/` — Crea producto (requiere campos principales + `size` y `color`)
- `PUT /api/products/:pid` — Actualiza por campos del body (no permite cambiar `id`)
- `DELETE /api/products/:pid` — Elimina un producto

## Rutas de Carritos
- `POST /api/carts` — Crea carrito `{ id, products: [] }`
- `GET /api/carts/:cid` — Lista `products` del carrito
- `POST /api/carts/:cid/product/:pid` — Agrega producto (si existe, incrementa `quantity`)

## Cómo correrlo
```bash
npm install
npm run dev
# o
npm start
```
Servidor: `http://localhost:8080`

## Ejemplo de creación de producto
POST `http://localhost:8080/api/products`
```json
{
  "title": "Vestido Floral",
  "description": "Vestido corto de verano estampado floral",
  "code": "VST-001",
  "price": 15999,
  "status": true,
  "stock": 20,
  "category": "vestidos",
  "size": "M",
  "color": "rosa",
}
```

## Ejemplo de flujo de compra
1) Crear carrito: `POST /api/carts` → `{ id, products: [] }`
2) Agregar producto: `POST /api/carts/{cid}/product/{pid}`
3) Listar productos del carrito: `GET /api/carts/{cid}`