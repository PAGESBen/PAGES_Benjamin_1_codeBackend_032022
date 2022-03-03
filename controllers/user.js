const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

//genration de l'url de l'image pour multer
const generateProfilImgUrl = (req) => {
    return `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
}

const generateDefaultProfileUrl = (req) => { // !jeremy : j'ai choisi de passer par cette fonction mais est ce une meilleure pratique de mettre une valeur pas défault directement dans la base?
    return `${req.protocol}://${req.get('host')}/images/defaultProfile.PNG`
}

//création d'un utilisateur
exports.userSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then( hash => {

            const imageURL = generateDefaultProfileUrl(req)

            db.promise().query(
                "INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `imageURL`, `position`) VALUES (?, ?, ?, ?, ?, ?)",
                [req.body.firstname, req.body.lastname, req.body.email, hash, imageURL, req.body.position] // sécurité : requête préparée
            )
                .then(() => res.status(201).json({message : "utilisateur créé avec succès !"}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}))
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

        const filename = rows[0].imageURL.split('/images/')[1]

        if(!req.file || filename === 'defaultProfile.PNG') { // si l'image est celle par défault ou qu'il n'y a pas d'image
            db.promise().query(
                'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?', 
                [userObject.firstname, userObject.lastname, userObject.email, userObject.position, userObject.newImg, req.params.id]
                )
                .then(() => res.status(200).json({ message : 'Profil utilisateur mis à jour avec succès !' }))
                .catch(error => res.status(400).json({error}));
        } else { // si il y avait une image et que ce n'etait pas l'image par défault on la supprime
            fs.unlink(`images/${filename}`, () => {
                db.promise().query(
                    'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?', 
                    [userObject.firstname, userObject.lastname, userObject.email, userObject.position, userObject.newImg, req.params.id]
                    )
                    .then(() => res.status(200).json({ message : 'Profil utilisateur mis à jour avec succès !' }))
                    .catch(error => res.status(400).json({error}));
            })
        }
    })
    .catch(error => res.status(500).json({error}));
}

//Suppression d'un user (admin uniquement)
exports.deleteOneUser = (req, res, next) => {
    db.promise().query(
        'SELECT `imageURL` FROM `user` WHERE `id` = ?',
        [req.params.id]
    )
    .then(([rows]) => {

        if (!req.auth.admin) {
            return res.status(403).json({
                error : new Error('Il faut etre administrateur pour pouvoir effectuer cette opération !').message
            })
        }

        const filename = rows[0].imageURL.split('/images/')[1]

        if(filename === 'defaultProfile.PNG'){
            db.promise().query(
                'DELETE FROM `user` WHERE `id` = ?', 
                [req.params.id]
            )
                .then(() => res.status(200).json({message : 'Utilisateur supprimé avec succès !'}))
                .catch(error => res.status(400).json({error}))
        } else {
            fs.unlink(`images/${filename}`, () => {
                db.promise().query(
                    'DELETE FROM `user` WHERE `id` = ?', 
                    [req.params.id]
                )
                    .then(() => res.status(200).json({message : 'Utilisateur supprimé avec succès !'}))
                    .catch(error => res.status(400).json({error}));
            })
        }
    })
    .catch(error => res.status(500).json({error}))
}

//Récuperation de tous les posts d'un user
exports.getUserPosts = (req, res, next) => {
    db.promise().query(
        'SELECT * from `post` WHERE `userId` = ?', 
        [req.params.id]
    )
    .then(([posts]) => res.status(200).json({posts}))
    .catch(error => res.status(500).json({error}));
}