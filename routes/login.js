var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); //la librería se llama Json web token

var SEED = require('../config/config').SEED; //Acá mandamos a llamar el SEED QUE NOS AYUDARÁ A VERIFICAR EL TOCKEN

var app = express();
var Usuario = require('../models/usuario');

// Google SignIn
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//=================================================================================================
// LOGIN GOOGLE
//=================================================================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .cath(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token Google no valido'
            });

        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'eRROR AL BUSCAR USUARIO',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación tradicional'
                });

            } else {
                //CREAR UN TOKEN! / Incluye 4 horas de expiración, y el Sed que tiene arroba es para devolver el valor correcto
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })


                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB, //ENVIO DE USUARIO DE BD QUE SE LOGUEO
                    token: token,
                    id: usuarioDB._id //CAMPO UTIL EN EL FRONT END ES EL ID DEL USUARIO

                });
            }

        } else {
            //USUARIO NO EXISTE. SE NECESIA CREARLO
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB, //ENVIO DE USUARIO DE BD QUE SE LOGUEO
                    token: token,
                    id: usuarioDB._id //CAMPO UTIL EN EL FRONT END ES EL ID DEL USUARIO

                });

            });
        }


    });

    //res.status(200).json({
    //    ok: true,
    //    googleUser: googleUser
    //});
});



//=================================================================================================
// LOGIN USER
//=================================================================================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'eRROR AL BUSCAR USUARIO',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'cREDENCIALES INCORRECTAS - email', //Se agrego el dash para saber en que punto está el error
                errors: err
            });
        }

        // CORROBORA SI EL USUARIO INGRESADO ES IGUAL AL QUE EL USUARIO ESTÁ INGRESANDO
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                //Se agrego el dash para saber en que punto está el error, EN PRODUCCIÓN YA NO SE DEJA PARA NO DARLE PISTO AL USUARIO EN DONDE SE EQUIVOCÓ
                mensaje: 'cREDENCIALES INCORRECTAS - password ',
                errors: err
            });
        }

        usuarioDB.password = ':)'; //Para que devuelva la carita feliz en vez de devolver la contraseña

        //CREAR UN TOKEN! / Incluye 4 horas de expiración, y el Sed que tiene arroba es para devolver el valor correcto
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })


        res.status(200).json({
            ok: true,
            usuario: usuarioDB, //ENVIO DE USUARIO DE BD QUE SE LOGUEO
            token: token,
            id: usuarioDB._id //CAMPO UTIL EN EL FRONT END ES EL ID DEL USUARIO

        });
    });

});


module.exports = app;