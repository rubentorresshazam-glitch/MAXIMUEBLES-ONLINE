const express = require('express');
const { enviarMensaje } = require('./../controllers/contacto.controller');
const router = express.Router();

// ✅ Enviar mensaje desde formulario de contacto → /api/enviar-contacto
router.post('/enviar-contacto', enviarMensaje);

module.exports = router;