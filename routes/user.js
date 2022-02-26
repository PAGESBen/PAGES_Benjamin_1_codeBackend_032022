const express = require('express');
const res = require('express/lib/response'); // jeremy! Ne sert à rien !
const router = express.Router();
const userCtrl = require('../controllers/user');
const db = require('../config/db');
const { getMaxListeners } = require('../config/db');

router.post('/auth/signup', userCtrl.userSignup /*fonction signup*/);
router.post('/auth/login', userCtrl.userLogin /*fonction login*/);
// router.get('/auth/getUser', userCtrl.userGet /*récupération du profil*/)
// router.put('/auth/modify', userCtrl.userModify /*modification du profil*/);

/** Route en attente pour faire les autres routes
 * Peut servir aux administrateurs pour donner des droits
 */

router.get('/user', (req, res, next) => {
    //Requete à placer dans le controler
    db.promise().query(
        "SELECT * FROM `user` WHERE `email` = ?", 
        ['amandine.mathieu13@gmail.co']
    )
        .then(([results, fields]) => console.log(results))
        .catch(() => res.status(401))

})

module.exports = router;