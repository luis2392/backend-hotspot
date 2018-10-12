var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =============================================================
// OBTENER TODOS LOS USUARIOS
// =============================================================

//RUTAS : 3 parametros: request, response, next
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') //Función de Mongoose para devolver los valores, los siguientes dos son los campos que muestre
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            })
})



// =============================================================
// aCTUALIZAR HOSPITAL
// ==============================================================

// :id' lo coonvierte en campo obligatorio
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body; //Se obtiene de la instrucción body se utiliza para actualizar la data, similar a la que se ocupo en el post


    Hospital.findById(id, (err, hospital) => {

        // Si hay un error, etonces enviara el error 500 de usuario no encontrado
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error el hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.nombre = req.usuario._id; //Graba el campo de usuario que modifico


        hospital.save((err, hospitalGuardado) => {

            //Se coloca ya que pueda ser que no nos envien los datos como son
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }



            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    })

});

// =============================================================
// Crear un nuevo hospital
//
// ==============================================================

//Se agregó el verifican tocken, para que cuando se cree un usuario pase por el verificatoken. Cómo segundo parámetro

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

// =============================================================
// borrar un hospital por ID
// ==============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    //Usuario: es el modelo
    Hospital.findByIdAndRemove(id, (err, hospitalborrado) => {

        // PRIMER LLAMADA AL CALL BACK err)
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        //VERIFICA SI VIENE UN USUARIO
        if (!hospitalborrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'NO EXISTE UN hospital CON ESE ID',
                errors: { mesagge: 'NO EXISTE UN hospital CON ESE ID' }
            });
        }

        //Segunda llamada al callback 
        res.status(200).json({
            ok: true,
            hospital: hospitalborrado
        });
    });
});

module.exports = app;