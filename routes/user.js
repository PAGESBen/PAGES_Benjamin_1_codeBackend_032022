const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const userCtrl = require('../controllers/user');
const db = require('../config/db');

router.post('/user/signup', userCtrl.userSignup /*fonction signup*/);
router.post('/user/login', userCtrl.userLogin /*fonction login*/);

router.get('/user', (req, res, next) => {
    //Requete à placer dans le controler
    db.promise().query(
        'SELECT * FROM `user`'
    )
        .then(([results, fields]) => console.log(results))
        .catch(() => res.status(401))

})

module.exports = router;