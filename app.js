// REQUIRES
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicialización de variables
var app = express();

//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//IMPORTACIÓN DE RUTAS
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HotspotDB', (err, res) => {
    if (err) throw err;
    console.log('BASE DE DATOS \x1b[32m%s\x1b[', 'en línea');
})

//RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Escucha de peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en port 3000: \x1b[32m%s\x1b[', 'en línea');
});