var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); //la librería se llama Json web token

var SEED = require('../config/config').SEED; //Acá mandamos a llamar el SEED QUE NOS AYUDARÁ A VERIFICAR EL TOCKEN

var app = express();
var Usuario = require('../models/usuario');
// 
// // Google SignIn
// var GoogleAuth = require('google-auth-library');
// var auth = new GoogleAuth;
// 
// const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
// const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;
// 
// // ==========================================
// //  Autenticación De Google
// // ==========================================
// app.post('/google', (req, res) => {
// 
//     var token = req.body.token || 'XXX';
// 
// 
//     var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
// 
//     client.verifyIdToken(
//         token,
//         GOOGLE_CLIENT_ID,
//         // Or, if multiple clients access the backend:
//         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
//         function(e, login) {
// 
//             if (e) {
//                 return res.status(400).json({
//                     ok: true,
//                     mensaje: 'Token no válido',
//                     errors: e
//                 });
//             }
// 
// 
//             var payload = login.getPayload();
//             var userid = payload['sub'];
//             // If request specified a G Suite domain:
//             //var domain = payload['hd'];
// 
//             Usuario.findOne({ email: payload.email }, (err, usuario) => {
// 
//                 if (err) {
//                     return res.status(500).json({
//                         ok: true,
//                         mensaje: 'Error al buscar usuario - login',
//                         errors: err
//                     });
//                 }
// 
//                 if (usuario) {
// 
//                     if (usuario.google === false) {
//                         return res.status(400).json({
//                             ok: true,
//                             mensaje: 'Debe de usar su autenticación normal'
//                         });
//                     } else {
// 
//                         usuario.password = ':)';
// 
//                         var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas
// 
//                         res.status(200).json({
//                             ok: true,
//                             usuario: usuario,
//                             token: token,
//                             id: usuario._id
//                         });
// 
//                     }
// 
//                     // Si el usuario no existe por correo
//                 } else {
// 
//                     var usuario = new Usuario();
// 
// 
//                     usuario.nombre = payload.name;
//                     usuario.email = payload.email;
//                     usuario.password = ':)';
//                     usuario.img = payload.picture;
//                     usuario.google = true;
// 
//                     usuario.save((err, usuarioDB) => {
// 
//                         if (err) {
//                             return res.status(500).json({
//                                 ok: true,
//                                 mensaje: 'Error al crear usuario - google',
//                                 errors: err
//                             });
//                         }
// 
// 
//                         var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas
// 
//                         res.status(200).json({
//                             ok: true,
//                             usuario: usuarioDB,
//                             token: token,
//                             id: usuarioDB._id
//                         });
// 
//                     });
// 
//                 }
// 
// 
//             });
// 
// 
//         });
// 
// 
// 
// 
// });
// 
// //=================================================================================================
//                                            LOGIN USER
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