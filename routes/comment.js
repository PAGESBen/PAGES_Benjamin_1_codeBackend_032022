const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');
const routeControl = require('../middleware/route-control');

//routes
router.post('/:post_id/comment', auth, routeControl.commentRoute, multer.upload, multer.fileControl, commentCtrl.postComment); //Add a comment
router.get('/:post_id/comment/:page/:limit', auth,routeControl.commentRoute, commentCtrl.getComment); //Get comments by PostId
router.put('/comment/:comment_id', auth, routeControl.commentRoute, multer.upload, multer.fileControl, commentCtrl.modifyOnecomment); //Modify a comment
router.delete('/comment/:comment_id', auth, admin, routeControl.commentRoute, multer.upload, multer.fileControl, commentCtrl.deleteOneComment);  //Delete a comment
router.post('/comment/:comment_id/like', auth, routeControl.commentRoute, commentCtrl.like); //Add or delete like

module.exports = router;