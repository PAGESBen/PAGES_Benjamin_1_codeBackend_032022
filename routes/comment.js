const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');

//routes
router.post('/:post_id/comment', auth, routeControl.commentRoute, multer.upload, multer.fileControl, commentCtrl.postComment); //Ajout d'un commentaire
router.get('/:post_id/comment/:page/:limit', auth,routeControl.commentRoute, commentCtrl.getComment); //Récuperation des commentaire d'un post
router.put('/comment/:comment_id', auth, routeControl.commentRoute, multer.upload, multer.fileControl, commentCtrl.modifyOnecomment); //Modification d'un commentaire
router.delete('/comment/:comment_id', auth, admin, routeControl.commentRoute, multer.upload, multer.fileControl, commentCtrl.deleteOneComment);  //Suppression d'un commentaire
router.post('/comment/:comment_id/like', auth, routeControl.commentRoute, commentCtrl.like); //Ajout ou suppression d'un like

module.exports = router;