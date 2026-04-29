const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); 
const verificarToken = require('./middlewares/authMiddleware'); // Importar el guardián

// Importar las rutas
const cargoRoutes = require('./routes/cargoRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const nominaRoutes = require('./routes/nominaRoutes');
const authRoutes = require('./routes/authRoutes'); // <--- Nueva

const app = express();

app.use(cors());
app.use(express.json()); 

// Rutas Públicas
app.use('/api/auth', authRoutes);

// Rutas Protegidas (Requieren Login)
app.use('/api/cargos', verificarToken, cargoRoutes);
app.use('/api/empleados', verificarToken, empleadoRoutes);
app.use('/api/nomina', verificarToken, nominaRoutes);

app.get('/', (req, res) => {
    res.send('API del Sistema de Nómina Uniautonoma funcionando al 100%');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});