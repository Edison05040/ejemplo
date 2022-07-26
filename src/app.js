const express = require('express');
const cookieParser = require('cookie-parser');
const conexion = require('express-myconnection');
require('dotenv').config({path: './env/.env'});
const mysql = require('mysql');
const path = require('path');
const app = express();

//seteos
app.set('port', process.env.Port || 3200);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//files static
app.use(express.static(path.join(__dirname, 'public')));

//middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//trabajar con cookie
app.use(cookieParser());

//7 SESSION
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//8 conexion database
//const conn = require('./database/db');

//9 rutas
app.use('/', require('./routers/router'));

app.use(function(req, res, next){
    if(!req.user){
        res.header('Cache-Control', 'private, no-chache, no-store, must-revalidate');
        next();
    }
})

//servidor
app.listen(app.get('port'), ()=>{
    console.log('Puerto ejecutandose: ', app.get('port'));
});