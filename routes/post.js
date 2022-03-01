const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, postCtrl.getAllPosts /**Récupération de tous les posts*/);
router.get('/:id', auth, postCtrl.getOnePost /**récuperation d'un post */)
router.post('/', auth, multer, postCtrl.postOnePost /**Ajout d'un post */);
router.put('/:id', auth, multer, postCtrl.modifyOnePost /**Modification d'un post */);
router.delete('/:id', auth, postCtrl.deleteOnePost /**Suppression d'un post */);


module.exports = router;