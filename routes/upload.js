var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs'); //NOS AYUDARÁ PARA EL MANEJO DE ARCHIVOS, EX: ELIMINAR FOTOGRAFÍAS

var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


//Default options Middleware
app.use(fileUpload());

//RUTAS : 3 parametros: request, response, next
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //TIPOS DE COLECCIÓN
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Ningún archivo seleccionado',
            errors: { message: 'Debes seleccionar una imagen' }
        });
    }

    //Obtener nombre del archivo para corroborar que sea imagen
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.'); // se obteniene la extensión ya que es el último punto
    var extensionArchivo = nombreCortado[nombreCortado.length - 1] //Obtiene solamente la última posición exactamente la extensión

    //Extensiones de archivos aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //VALIDACIÓN DE QUE EL ARCHIVO QUE SE SUBA SEA EL CORRECTO
    if (extensionesValidas.indexOf(extensionArchivo) < 0) { //SI DEVUELVE -1 SIGNIFICA QUE NO LO ENCONTRO
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Debes seleccionar una extensión de imagen: ' + extensionesValidas.join(', ') } // join muestra las extensiones y las va separando por la coma y el espacio
        });
    }

    //NOMBRE DE ARCHIVO PERSONALIZADO
    //template: 12123232443434-123.png, le asignirá los milisegundos en que se cargue
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    //Mover el archivo del temporal a un path | primero mueve hacia la carpeta, y lo ubica en base a la validación que se hizo, y posterior asigna el nombre del archivo
    var path = `./uploads/${ tipo }/ ${ nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);



    })




});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) { // VALIDA QUE EL DATO EXISTA
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    usuario: { message: 'Usuairo no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img; //Para validar si el usuario ya tenía otra imagen anteriormente
            //Si existe, elimina la imagen anterior, para no sobreescribir
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizado',
                    usuario: usuarioActualizado
                });

            })

        });

    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    usuario: { message: 'Medico no existe' }
                });


            }

            var pathViejo = './uploads/medicos/' + medico.img; //Para validar si el usuario ya tenía otra imagen anteriormente
            //Si existe, elimina la imagen anterior, para no sobreescribir
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizado',
                    medico: medicoActualizado
                });

            })

        });

    }


    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) { // VALIDA QUE EL DATO EXISTA
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    usuario: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img; //Para validar si el usuario ya tenía otra imagen anteriormente
            //Si existe, elimina la imagen anterior, para no sobreescribir
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizado',
                    medico: hospitalActualizado
                });

            })

        });

    }
}



module.exports = app;