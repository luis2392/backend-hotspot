var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// =============================================================
// OBTENER TODOS LOS USUARIOS
// =============================================================

//RUTAS : 3 parametros: request, response, next
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo

                    });

                });

            });

});

// =============================================================
// aCTUALIZAR HOSPITAL
// ==============================================================

// :id' lo coonvierte en campo obligatorio
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body; //Se obtiene de la instrucción body se utiliza para actualizar la data, similar a la que se ocupo en el post


    Medico.findById(id, (err, medico) => {

        // Si hay un error, etonces enviara el error 500 de usuario no encontrado
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error el medico con el id' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.nombre = req.usuario._id;
        medico.nombre = body.hospital; //Graba el campo de usuario que modifico


        medico.save((err, medicoGuardado) => {

            //Se coloca ya que pueda ser que no nos envien los datos como son
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }



            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    })

});

// =============================================================
// Crear un nuevo medico
//
// ==============================================================

//Se agregó el verifican tocken, para que cuando se cree un usuario pase por el verificatoken. Cómo segundo parámetro

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});

// =============================================================
// borrar un medico por ID
// ==============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    //Usuario: es el modelo
    Medico.findByIdAndRemove(id, (err, medicoborrado) => {

        // PRIMER LLAMADA AL CALL BACK err)
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        //VERIFICA SI VIENE UN USUARIO
        if (!medicoborrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'NO EXISTE UN medico CON ESE ID',
                errors: { mesagge: 'NO EXISTE UN medico CON ESE ID' }
            });
        }

        //Segunda llamada al callback 
        res.status(200).json({
            ok: true,
            medico: medicoborrado
        });
    });
});

module.exports = app;