const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');

router.post('/auth/signup', userCtrl.userSignup);  //fonction signup
router.post('/auth/login', userCtrl.userLogin);  //fonction login
router.get('/user/:user_id', auth, routeControl.userRoute, userCtrl.getOneUser); //récupération d'un profil
router.put('/user/:user_id', auth, routeControl.userRoute, multer, userCtrl.modifyOneUser); //modification du profil
router.delete('/user/:user_id', auth, admin, routeControl.userRoute, userCtrl.deleteOneUser); //Suppresion d'un profil
router.get('/user/:user_id/posts', auth, routeControl.userRoute, userCtrl.getUserPosts); //Récuperation des posts d'un user

module.exports = router;