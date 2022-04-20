const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');


router.get('/:page/:limit', auth.verifyToken, auth.userExist, postCtrl.getAllPosts);  //Get all post
router.get('/:post_id', auth.verifyToken, auth.userExist, routeControl.postRoute, postCtrl.getOnePost);  //get one post
router.post('/', auth.verifyToken, auth.userExist, routeControl.postRoute, multer.upload, multer.fileControl, postCtrl.postOnePost); //Add one post
router.put('/:post_id', auth.verifyToken, auth.userExist, routeControl.postRoute, multer.upload, multer.fileControl, postCtrl.modifyOnePost);  //Modify one post
router.delete('/:post_id', auth.verifyToken, auth.userExist, routeControl.postRoute, admin, postCtrl.deleteOnePost); //delete one post
router.post('/:post_id/like', auth.verifyToken, auth.userExist, routeControl.postRoute, postCtrl.like); //Add or delete like

module.exports = router;