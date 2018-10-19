// REQUIRES
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicialización de variables
var app = express();

//CORS (HABILITA PARA PODER RECIBIR PETIICIONES, NO DEBE QUEDAR ASI)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//IMPORTACIÓN DE RUTAS
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HotspotDB', (err, res) => {
    if (err) throw err;
    console.log('BASE DE DATOS \x1b[32m%s\x1b[', 'en línea');
});

//Server index Config (MOSTRAR IMAGENES)
//var serveIndex = require('serve-index');
//app.use(express.static(__dirname + '/'))
//app.use('/uploads', serveIndex(__dirname + '/uploads'));

//RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

//Escucha de peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en port 3000: \x1b[32m%s\x1b[', 'en línea');
});