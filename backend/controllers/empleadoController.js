const db = require('../config/db');

// Obtener lista completa con datos de cargo (RF01)
exports.getEmpleados = async (req, res) => {
    try {
        const [empleados] = await db.query(`
            SELECT e.*, c.nombre_cargo, c.salario_base 
            FROM empleados e 
            LEFT JOIN cargos c ON e.id_cargo = c.id_cargo
            ORDER BY e.apellido ASC
        `);
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los empleados' });
    }
};

// Registrar empleado
exports.createEmpleado = async (req, res) => {
    const { documento, nombre, apellido, email, id_cargo, fecha_ingreso } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO empleados (documento, nombre, apellido, email, id_cargo, fecha_ingreso, estado) VALUES (?, ?, ?, ?, ?, ?, "Activo")',
            [documento, nombre, apellido, email, id_cargo, fecha_ingreso]
        );
        res.status(201).json({ message: 'Empleado registrado con éxito', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error: El documento o email ya existen en el sistema.' });
    }
};

// Actualizar información del empleado (RF01)
exports.updateEmpleado = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, id_cargo, estado } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE empleados SET nombre = ?, apellido = ?, email = ?, id_cargo = ?, estado = ? WHERE id_empleado = ?',
            [nombre, apellido, email, id_cargo, estado, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

        res.json({ message: 'Información del empleado actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando los datos del empleado' });
    }
};

// Desactivación lógica (No borra para preservar historial de nómina RF04)
exports.deleteEmpleado = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE empleados SET estado = 'Inactivo' WHERE id_empleado = ?", [id]);
        res.json({ message: 'Empleado marcado como Inactivo' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar el estado del empleado' });
    }
};

// Nueva función específica para el select de novedades
exports.getEmpleadosActivos = async (req, res) => {
    try {
        const [empleados] = await db.query(`
            SELECT id_empleado, nombre, apellido 
            FROM empleados 
            WHERE estado = 'Activo'
            ORDER BY apellido ASC
        `);
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los empleados activos' });
    }
};

// ELIMINACIÓN FÍSICA (REQUERIMIENTO EXTREMO)
exports.hardDeleteEmpleado = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query("DELETE FROM empleados WHERE id_empleado = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
        res.json({ message: 'Empleado eliminado permanentemente del sistema' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el registro. Es posible que tenga historial vinculado.' });
    }
};