const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const conexion = require('../database/db');
const {promisify} = require('util');
const exp = require('constants');

//procedimiento para registrar
exports.registrar = async (req, res)=>{
    try {
        const name = req.body.name;
        const user = req.body.user;
        const pass = req.body.pass;
        let passHash = await bcryptjs.hash(pass, 8);
        conexion.query('INSERT INTO user SET?', {name:name, user:user, pass:passHash}, (err, results)=>{
            if(err) return res.send(err);
            res.redirect('/login');
        }); 
    } catch(error){
        console.log(error)
    }
}

exports.login = async (req, res)=>{
    try {
        const user = req.body.user;
        const pass = req.body.pass;
        if(!user || !pass){
            res.render('login',{
                alert: true,
                alertTitle: 'Advertencia',
                alertMessage: 'Llene los campos',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        } else{
            conexion.query('SELECT * FROM user WHERE user = ?', [user], async (err, datos)=>{
                if(datos.length == 0 || !(await bcryptjs.compareSync(pass, datos[0].pass))){
                    res.render('login',{
                        alert: true,
                        alertTitle: 'Advertencia',
                        alertMessage: 'Datos incorrectos',
                        alertIcon: 'info',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                }else {
                    const id = datos[0].id;
                    const token = jwt.sign({id:id}, process.env.SECRETO, {
                        expiresIn: process.env.TIEMPO
                    });
                    console.log('token: ' + token + 'user: ' + user);
                    const cookieOptions = {
                        expires: new Date(Date.now()+process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    };
                    res.cookie('jwt', token, cookieOptions);
                    conexion.query('SELECT * FROM estudiante', (err, rows)=>{
                        res.render('index', {
                            data: rows
                        });
                    })                  
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
};

exports.list = (req, res)=>{
    conexion.query('select * from estudiante', (err, datos)=>{
        res.render('index', {
            data:datos
        })
    })
}

exports.edit = (req, res)=>{
    conexion.query('SELECT * FROM estudiante WHERE codigo=?', [req.params.codigo], (err, datos)=>{
        res.render('estudianteEdit', {
            data:datos[0]
        })
    })
}

exports.update = (req, res)=>{
    conexion.query('UPDATE estudiante SET ? WHERE codigo=?', [req.body, req.params.codigo], (err, datos)=>{
        res.redirect('/');
    })
}

exports.isAuthenticated = async (req, res, next)=>{
    if(req.cookies.jwt){
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.SECRETO)
            conexion.query('SELECT * FROM docente WHERE id = ?', [decodificada.id], (err, resutl)=>{
                if(!resutl) return next();
                req.user = resutl[0];
                return next();
            })
        } catch (error) {
            console.log(error);
            return next()
        }
    } else{
        res.redirect('/login')
    }
}
exports.save = (req, res)=>{
    conexion.query('INSERT INTO estudiante set?', [req.body], (err, rows)=>{
        if(err) return res.send(err);
        conexion.query('SELECT * from estudiante', (err, datos)=>{
            res.render('index', {
                data:datos
            })
        })
    })
}

exports.delete = (req, res)=>{
    conexion.query('DELETE FROM estudiante WHERE codigo=?', [req.params.codigo], (err, rows)=>{
        if(err) return res.send(err);
        res.redirect('/');
        /*conexion.query('SELECT * from estudiante', (err, datos)=>{
            res.render('index', {
                data:datos
            })
        })*/
    })
}

exports.logout = (req, res)=>{
    res.clearCookie('jwt');
    return res.redirect('/');
}