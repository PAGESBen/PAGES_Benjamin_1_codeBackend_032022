const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

//genration de l'url de l'image pour multer
const generateProfilImgUrl = (req) => {
    return `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
}

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
                return res.status(404).json({ message : 'utilisateur introuvable !!!' })
            }
            bcrypt.compare(req.body.password, rows[0].password)
                .then(valid => {
                    if (!valid){
                        return res.status(401).json({ message : 'mot de passe incorrect !' })
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

//récuperation du profil d'un user
exports.getOneUser = (req, res, next) => {
    db.promise().query(
        'SELECT `id`, `firstname`, `lastname`, `email`, `imageURL`, `position`  FROM `user` WHERE `id` =?', 
        [req.params.id] //l'id de l'utilisateur est celui de l'URL
        )
        .then(([rows]) => {
            if(!rows[0]) {
                return res.status(404).json({ message : 'utilisateur introuvable !!!' })
            } else {
                return res.status(200).json(rows[0])
            }
        })
        .catch((error) => res.status(500).json({error}));
}

//Modification de la fiche d'un utilisateur
exports.modifyOneUser = (req, res, next) => {

    db.promise().query(
        'SELECT `id`, `imageURL` FROM `user` WHERE `id` = ? ', 
        [req.params.id]
    )
    .then(([rows]) => {

        // si l'utilisateur n'est pas trouvé
        if(!rows[0]) {
            return res.status(404).json({
                error : new Error('Utilisateur introuvable !!!').message
            });
        }

        //si l'utilisateur ne correspond pas au demandeur
        if(rows[0].id !== req.auth.userId) {
            return res.status(403).json({
                error : new Error('Vous ne disposez pas des droits nécéssaires pour faire cette action !!!').message
            });
        }

        //si la requete contient une nouvelle image
        const userObject = req.file ?
        {
            ...JSON.parse(req.body.user), 
            newImg : generateProfilImgUrl(req)
        } : {
            ...req.body,
            newImg : rows[0].imageURL
        }

        //on va modifier l'utilisateur
        db.promise().query(
            'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?', 
            [userObject.firstname, userObject.lastname, userObject.email, userObject.position, userObject.newImg, req.params.id]
            )
            .then(() => res.status(200).json({ message : 'Profil utilisateur mis à jour avec succès !' }))
            .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
}



//Middleware de test

exports.test = (req, res, next) => {

    const userObject = req.file ?
    {
        ...JSON.parse(req.body.user), 
        newImg : generateProfilImgUrl(req)
    } : {
        ...req.body, 
        // newImg : "url de ma super image"
    }

    console.log(userObject)

    return res.status(200).json({userObject})
}
