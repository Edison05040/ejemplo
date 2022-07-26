const res = require('express/lib/response');
require('dotenv').config({path: './env/.env'});
const mysql = require('mysql');


const conexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB
});
conexion.connect((err)=>{
    if(err){
        return res.send(err)
    }
    console.log('contectado a la bd')
})
module.exports = conexion;