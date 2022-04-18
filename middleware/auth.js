const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
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
