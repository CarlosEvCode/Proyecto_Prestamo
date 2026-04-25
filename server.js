require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/api/catalogos', require('./routes/catalogos'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/herramientas', require('./routes/herramientas'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/trabajadores', require('./routes/trabajadores'));

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Inciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;