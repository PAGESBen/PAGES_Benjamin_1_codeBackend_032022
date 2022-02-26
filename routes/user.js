const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');

router.post('/auth/signup', userCtrl.userSignup /*fonction signup*/);
router.post('/auth/login', userCtrl.userLogin /*fonction login*/);
router.get('/user/:id', auth, userCtrl.getOneUser /*récupération d'un profil*/)
router.put('/user/:id', auth, userCtrl.modifyOneUser /*modification du profil*/);

module.exports = router;