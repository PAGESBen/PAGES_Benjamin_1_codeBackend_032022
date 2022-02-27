const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {

        if(!req.headers.authorization) { // !jeremy : à verifier si c'est la bonne façon de faire ?
            throw new Error("Un token d'identification est nécéssaire pour cette action").message;
        }

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
