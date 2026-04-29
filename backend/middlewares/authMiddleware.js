const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

    try {
        const verificado = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verificado;
        next(); // Si el token es válido, continúa a la ruta
    } catch (error) {
        res.status(400).json({ error: 'Token no válido' });
    }
};