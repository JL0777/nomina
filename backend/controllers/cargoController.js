const db = require('../config/db');

// Obtener todos los cargos
exports.getCargos = async (req, res) => {
    try {
        const [cargos] = await db.query('SELECT * FROM cargos ORDER BY nombre_cargo ASC');
        res.json(cargos);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los cargos' });
    }
};

// Crear nuevo cargo
exports.createCargo = async (req, res) => {
    const { nombre_cargo, salario_base } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO cargos (nombre_cargo, salario_base) VALUES (?, ?)', 
            [nombre_cargo, salario_base]
        );
        res.status(201).json({ message: 'Cargo creado con éxito', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error creando el cargo' });
    }
};

// Actualizar cargo existente (RF02)
exports.updateCargo = async (req, res) => {
    const { id } = req.params;
    const { nombre_cargo, salario_base } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE cargos SET nombre_cargo = ?, salario_base = ? WHERE id_cargo = ?',
            [nombre_cargo, salario_base, id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Cargo no encontrado' });
        
        res.json({ message: 'Cargo actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando el cargo' });
    }
};

// Eliminar cargo
exports.deleteCargo = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM cargos WHERE id_cargo = ?', [id]);
        res.json({ message: 'Cargo eliminado' });
    } catch (error) {
        // Error común: Integridad referencial
        res.status(500).json({ error: 'No se puede eliminar: el cargo está asignado a empleados activos' });
    }
};