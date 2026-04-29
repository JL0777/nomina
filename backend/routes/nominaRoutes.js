const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nominaController');

// Rutas para cumplir con RF03 y RF04
router.post('/novedades', nominaController.registrarNovedad);
router.post('/calcular', nominaController.calcularNominaMensual);
router.get('/historial', nominaController.getHistorialNomina);

// --- NUEVAS RUTAS PARA GESTIÓN DE NOVEDADES ---
router.get('/novedades', nominaController.getNovedades); // Para listar en la tabla
router.put('/novedades/:id', nominaController.actualizarNovedad); // Para editar
router.delete('/novedades/:id', nominaController.eliminarNovedad); // Para borrar

module.exports = router;