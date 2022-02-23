const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const userCtrl = require('../controllers/user');
const db = require('../config/db');

// router.post('/signup', userCtrl.userSignup /*fonction signup*/);
// router.post('/login', userCtrl.userLogin /*fonction login*/);

router.get('/users', (req, res, next) => {
    //Requete à placer dans le controler
    db.promise().query(
        'SELECT * FROM `user` WHERE `email` = ?',
        ["jzunino@gmail.com"] // sécurité : requête préparée
    )
        .then(([results, fields]) => console.log(results))
        .catch(() => res.status(401))

})

module.exports = router;