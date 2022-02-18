const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
        const userId= decodedToken.userId;
        req.auth = { userId }; //Ajout du user Id au body de la requête pour securiser la route de suppression de sauce
        if (req.body.userId && req.body.userId !== userId) {
            throw 'unauthorized request';
        } else {
            next()
        }
    } catch (error) {
        res.status(403).json({error : error || 'unauthorized request'})
    }
};