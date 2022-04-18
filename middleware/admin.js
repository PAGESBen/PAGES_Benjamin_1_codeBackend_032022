const db = require('../config/db');
const sql = require('../config/sqlRequest');

module.exports = (req, res, next) => {
    db.promise().query(
        sql.admin,
        [req.auth.userId]
    )
    .then(([user]) => {

        req.auth = {
            ...req.auth,
            admin : user[0].admin
        }

        next()

    })
    .catch(error => res.status(500).json({error}));
};