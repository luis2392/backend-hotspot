var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// =============================================================
// OBTENER TODOS LOS USUARIOS
// =============================================================

//RUTAS : 3 parametros: request, response, next
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: ' cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios

                });
            })

})



// =============================================================
// aCTUALIZAR uSUARIOS
// ==============================================================

// :id' lo coonvierte en campo obligatorio
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body; //Se obtiene de la instrucción body se utiliza para actualizar la data, similar a la que se ocupo en el post


    Usuario.findById(id, (err, usuario) => {

        // Si hay un error, etonces enviara el error 500 de usuario no encontrado
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error el usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            //Se coloca ya que pueda ser que no nos envien los datos como son
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)'; //PARA NO RETORNAR LA CONTRASEÑA

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    })

});

// =============================================================
// Crear un usuario
//
// ==============================================================

//Se agregó el verifican tocken, para que cuando se cree un usuario pase por el verificatoken. Cómo segundo parámetro

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario

        });
    });

});

// =============================================================
// borrar un usuario por ID
// ==============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    //Usuario: es el modelo
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        // PRIMER LLAMADA AL CALL BACK err)
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        //VERIFICA SI VIENE UN USUARIO
        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'NO EXISTE UN USUARIO CON ESE ID',
                errors: { mesagge: 'NO EXISTE UN USUARIO CON ESE ID' }
            });
        }

        //Segunda llamada al callback 
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;