const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');

router.get('/:page/:limit', auth, postCtrl.getAllPosts);  //Récupération de tous les posts -> pagination
router.get('/:post_id', auth, routeControl.postRoute, postCtrl.getOnePost);  //récuperation d'un post
router.post('/', auth, routeControl.postRoute, multer, postCtrl.postOnePost); //Ajout d'un post
router.put('/:post_id', auth, routeControl.postRoute, multer, postCtrl.modifyOnePost);  //Modification d'un post
router.delete('/:post_id', auth, routeControl.postRoute, admin, postCtrl.deleteOnePost); //Suppression d'un post
router.post('/:post_id/like', auth, routeControl.postRoute, postCtrl.like); //Liker ou deliker un post

module.exports = router;