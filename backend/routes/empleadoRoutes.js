const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/', empleadoController.getEmpleados);
router.post('/', empleadoController.createEmpleado);
router.put('/:id', empleadoController.updateEmpleado);
router.delete('/:id', empleadoController.deleteEmpleado); // Desactivación lógica
router.get('/activos', empleadoController.getEmpleadosActivos);
router.delete('/fuerza/:id', empleadoController.hardDeleteEmpleado); 

module.exports = router;