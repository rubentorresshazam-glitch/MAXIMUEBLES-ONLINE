const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');

// ✅ Rutas del carrito → /api/carrito
router.get('/', carritoController.verCarrito);        // Ver carrito completo
router.post('/', carritoController.agregar);          // Agregar producto
router.put('/:id', carritoController.actualizar);    // Cambiar cantidad
router.delete('/:id', carritoController.eliminar);   // Eliminar un producto
router.delete('/', carritoController.vaciar);          // Vaciar carrito completo

module.exports = router;