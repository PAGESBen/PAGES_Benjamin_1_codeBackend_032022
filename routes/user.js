const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')

router.post('/auth/signup', userCtrl.userSignup /*fonction signup*/);
router.post('/auth/login', userCtrl.userLogin /*fonction login*/);
router.get('/user/:id', auth, userCtrl.getOneUser /*récupération d'un profil*/)
router.put('/user/:id', auth, multer, userCtrl.modifyOneUser /*modification du profil*/);
router.delete('/user/:id', auth, userCtrl.deleteOneUser /*Suppresion d'un profil*/)


// route de test
// router.put('/user/:id',
// auth, 
// multer,
// userCtrl.test)

module.exports = router;