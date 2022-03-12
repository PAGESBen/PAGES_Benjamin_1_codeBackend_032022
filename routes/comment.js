const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');

//routes
router.post('/:post_id/comment', auth, routeControl.commentRoute, multer, commentCtrl.postComment); //Ajout d'un commentaire
router.get('/:post_id/comment', auth,routeControl.commentRoute, commentCtrl.getComment); //Récuperation des commentaire d'un post
router.put('/comment/:comment_id', auth, routeControl.commentRoute, multer, commentCtrl.modifyOnecomment); //Modification d'un commentaire
router.delete('/comment/:comment_id', auth, admin, routeControl.commentRoute, multer, commentCtrl.deleteOneComment);  //Suppression d'un commentaire
router.post('/comment/:comment_id/like', auth, routeControl.commentRoute, commentCtrl.like); //Ajout ou suppression d'un like
router.get('/comment/:comment_id/likes', auth, routeControl.commentRoute, commentCtrl.likes); //Récupère le nombre de like d'un commentaire

module.exports = router;