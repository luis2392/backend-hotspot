// REQUIRES
var express = require('express');
var mongoose = require('mongoose')



// Inicialización de variables
var app = express();

//Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HotspotDB', (err, res) => {

    if (err) throw err;
    console.log('BASE DE DATOS \x1b[32m%s\x1b[', 'en línea');

})

//RUTAS : 3 parametros: request, response, next
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente.'

    });
});


//Escucha de peticiones
app.listen(3000, () => {
    console.log('Express Server corriendo en port 3000: \x1b[32m%s\x1b[', 'en línea');
});