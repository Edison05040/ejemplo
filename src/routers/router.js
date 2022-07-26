const express = require('express');
const router = express.Router();
const authController = require('../controllers/authontroller');

//para las vistas 
router.get('/', authController.isAuthenticated, authController.list);

router.post('/add', authController.save);

router.get('/delete/:codigo', authController.delete);

router.get('/update/:codigo', authController.edit);

router.post('/update/:codigo', authController.update);


router.get('/login', (req, res)=>{
    res.render('login', {alert:false});
});
router.get('/register', (req, res)=>{
    res.render('register');
});

//para metodos del controller
router.post('/register', authController.registrar);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
module.exports = router;