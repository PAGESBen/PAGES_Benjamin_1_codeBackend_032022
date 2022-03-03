const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('../middleware/multer-config');

//routes
router.post('/:id/comment', auth, multer, commentCtrl.postComment /**Ajout d'un commentaire */);
router.get('/:id/comment', auth, commentCtrl.getComment /**Récuperation des commentaire d'un post */);
router.put('/comment/:id', auth, multer, commentCtrl.modifyOnecomment /**Modification d'un commentaire */);
router.delete('/comment/:id', auth, admin, multer, commentCtrl.deleteOneComment /**Suppression d'un commentaire */);

module.exports = router;