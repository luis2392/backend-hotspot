var jwt = require('jsonwebtoken'); //la librería se llama Json web token
var SEED = require('../config/config').SEED; //Acá mandamos a llamar el SEED QUE NOS AYUDARÁ A VERIFICAR EL TOCKEN



// =============================================================
// verificar tocken (procesar token), se colca acá para que valide antes de comenzar las modificaciones 
// ==============================================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token; //Llmada al tocken


    // PRIMER PARAMETRO TOKEN QUE ESTÁ PIDIENDO LA PETICIÓN,  SEGUNDO PARAMETRO: SEED, CALLBACK QUE TIENE ERROR Y UN DECODED
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}