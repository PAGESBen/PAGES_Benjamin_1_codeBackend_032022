const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//création d'un utilisateur
exports.userSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then( hash => {
            db.promise().query(
                "INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `position`) VALUES (?, ?, ?, ?, ?)",
                [req.body.firstname, req.body.lastname, req.body.email, hash, req.body.position] // sécurité : requête préparée
            )
                .then(() => res.status(201).json({message : "utilisateur créé avec succès !"}))
                .catch(error => res.status(400).json({error}));
        })
        .catch((err => res.status(401).json({message : 'mot de passe incorrect'})))
    
};

//login utilisateur
exports.userLogin = (req, res, next) => {
    db.promise().query(
        "SELECT * FROM `user` WHERE `email` = ?", 
        [req.body.email]
    )
        .then(([rows]) => { // jeremy! :  fields pas obligatoire !!!
            if (!rows[0]) {
                return res.status(401).json({ message : 'utilisateur introuvable !!!'})
            }
            bcrypt.compare(req.body.password, rows[0].password)
                .then(valid => {
                    if (!valid){
                        return res.status(401).json({ message : 'mot de passe incorrect !'})
                    }
                    res.status(200).json({
                        userId : rows[0].id,
                        token : jwt.sign(
                            { userId : rows[0].id }, 
                            process.env.TOKEN_KEY,
                            { expiresIn : '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
            })
            .catch(error => res.status(500).json({error}));

}

exports.userGet = (req, res, next) => {
    db.promise().query(
        'SELECT * FROM `user` WHERE `email` =?', 
        [req.body.email]
        )
        .then (([rows, fields]) => {
            if(!rows[0].id) {
                return res.status(401)
            }
            
        }) 
}