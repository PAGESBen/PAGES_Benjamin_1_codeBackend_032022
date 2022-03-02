const db = require('../config/db');

module.exports = (req, res, next) => {
    db.promise().query(
        'SELECT `admin` FROM `user` WHERE `id`= ?',
        [req.auth.userId]
    )
    .then(([user]) => {

        req.auth = {
            ...req.auth,
            admin : user[0].admin
        }

        next()

    })
    .catch(error => res.status(400).json({error}));
};