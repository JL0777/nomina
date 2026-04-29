const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Registro de Usuarios
exports.registrar = async (req, res) => {
    const { username, password, email, id_rol } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedLoginPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO usuarios (username, password, email, id_rol) VALUES (?, ?, ?, ?)',
            [username, hashedLoginPassword, email, id_rol]
        );
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

// 2. Login Corregido
exports.login = async (req, res) => {
    // Cambiamos 'username' por 'identifier' para que sea más claro
    const { username: identifier, password } = req.body; 
    
    try {
        // CORRECCIÓN: Buscamos por username O por email
        const [rows] = await db.query(
            `SELECT u.*, r.nombre_rol 
             FROM usuarios u 
             JOIN roles r ON u.id_rol = r.id_rol 
             WHERE u.username = ? OR u.email = ?`,
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario o correo no encontrado' });
        }

        const usuario = rows[0];

        // CORRECCIÓN DE SEGURIDAD: Verificar contraseña con Bcrypt
        const validPassword = await bcrypt.compare(password, usuario.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Crear Token
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.nombre_rol },
            process.env.JWT_SECRET || 'secret_key_temporal', // Asegúrate de tener tu .env
            { expiresIn: '2h' }
        );

        res.json({
            token,
            user: {
                id: usuario.id_usuario,
                username: usuario.username,
                rol: usuario.nombre_rol
            }
        });
    } catch (error) {
        console.error("Error en Login:", error);
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};