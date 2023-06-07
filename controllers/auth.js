const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google-verify');
const usuario = require('../models/usuario');
const { getMenuFrontEnd } = require('../helpers/menu-frontend');

const login = async( req, res = response ) => {

    const {email, password } = req.body;

    try {
        //Verificar Email
        const usuarioDB = await Usuario.findOne({email});

        if ( !usuarioDB ){
            return res.status(404).json({
                ok: false,
                msg: 'Email no valida'
            });

        }


        //verificar contraseña
        const validpassword = bcrypt.compareSync(password, usuarioDB.password);
        if(!validpassword){
            return res.status(400).json({
                ok: false,
                msg: 'Conttraseña no valida'
            })
        }


        //Generar el TOKEN - JWT
        const token = await generarJWT( usuarioDB.id );

        res.json({
            ok: true,
            token,
            menu: getMenuFrontEnd( usuarioDB.role )
        });

    }catch(error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const googleSignIn = async( req, res = response ) => {

    try {
        const { email, name, picture } = await googleVerify( req.body.token );

        const usuarioDB = await Usuario.findOne({ email });
        let usuario;

        if ( !usuarioDB ) {
            //si no existe el usuario
            usuario = new Usuario({
                nombre: name,
                email,
                password: '@@@',
                img: picture,
                google: true
            });
        } else {
            //si existe el usuario
            usuario = usuarioDB;
            usuario.google = true;
        }

        // Guardar Usuario
        await usuario.save();

        // Generar el TOKEN - JWT
        const token = await generarJWT( usuario.id );


        res.json({
            ok: true,
            // email, name, picture,
            token,
            menu: getMenuFrontEnd( usuario.role )

        });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Token de Google no es correcto'
        });
    }
    


}


const renewToken = async (req, res = response ) => {

    const uid = req.uid;

    //Generar el Token -JWT
    const token = await generarJWT( uid );

    //Obtener el usuario por UID
    const usuario = await Usuario.findById(uid);

    res.json({
        ok: true,
        token,
        usuario,
        menu: getMenuFrontEnd( usuario.role )

    });
}


module.exports = {
    login,
    googleSignIn,
    renewToken,
}
