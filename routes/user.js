const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');

router.post('/auth/signup', userCtrl.userSignup);  //fonction signup
router.post('/auth/login', userCtrl.userLogin);  //fonction login
router.get('/user/:id', auth, userCtrl.getOneUser); //récupération d'un profil
router.put('/user/:id', auth, multer, userCtrl.modifyOneUser); //modification du profil
router.delete('/user/:id', auth, admin, userCtrl.deleteOneUser); //Suppresion d'un profil
router.get('/user/:id/posts', auth, userCtrl.getUserPosts); //Récuperation des posts d'un user

router.get('/user/:id/test', userCtrl.test);

module.exports = router;