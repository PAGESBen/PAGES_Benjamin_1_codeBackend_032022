const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');

router.post('/auth/signup', routeControl.userRoute, userCtrl.userSignup);  //signup
router.post('/auth/login', userCtrl.userLogin);  //login
router.get('/user/:user_id', auth, userCtrl.getOneUser); //get one profile
router.put('/user/:user_id', auth, routeControl.userRoute, multer.upload, multer.fileControl, userCtrl.modifyOneUser); //modify one profile
router.delete('/user/:user_id', auth, admin, routeControl.userRoute, userCtrl.deleteOneUser); //Delete one profile
router.get('/user/:user_id/posts/:page/:limit', auth, routeControl.userRoute, userCtrl.getUserPosts); //get user posts

module.exports = router;