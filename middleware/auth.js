const jwt = require('jsonwebtoken');
const db = require('../config/db');
const sql = require('../config/sqlRequest');

//check if Auth Token is valid
exports.verifyToken = (req, res, next) => {
    try {
        if(!req.headers.authorization) { //if there is no token
            throw new Error("Token is required").message;
        }

        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
        const userId= decodedToken.userId;
        req.auth = { userId }; //add userId to req for next controllers
        if (req.body.userId && req.body.userId !== userId) {
            throw 'unauthorized request';
        } else {
            next()
        }
    } catch (error) {
        res.status(403).json({error : error || 'unauthorized request'})
    }
};

//check if auth.userId exist
exports.userExist = async (req, res, next) => {
    try {
        let [user] = await db.promise().query(
            sql.getUserId,
            [req.auth.userId]
        )

        if(user.length === 0) {
            return res.status(404).json({
                error : new Error('Token is valid but user has not been not found').message
            })
        } else {
            next()
        }

    } catch (e) {
        res.status(500).json({e})
    }
}