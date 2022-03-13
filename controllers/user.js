const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('../config/sqlRequest');
const tool = require('../config/tool');
const fs = require('fs');

//création d'un utilisateur
exports.userSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then( hash => {

            const imageURL = tool.getImgUrl(req, 'profile', 'defaultProfile.PNG')

            db.promise().query(
                sql.createUser,
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
        sql.getUserByMail, 
        [req.body.email]
    )
        .then(([rows]) => { // jeremy! :  fields pas obligatoire !!!
            if (!rows[0]) {
                return res.status(404).json({
                    error : new Error('L\'adresse mail est inconnue !').message
                })
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
        sql.getUserProfil, 
        [req.params.user_id]
        )
        .then(([user]) => {

            if (user.length === 0) {
                return res.status(404).json({
                    error : new Error('l\'utilisateur n\'existe pas').message
                })
            }

            res.status(200).json(user[0])
        })
        .catch((error) => res.status(500).json({error}));
}

//Modification de la fiche d'un utilisateur
exports.modifyOneUser = async (req, res, next) => {

    try{
        const [user] = await db.promise().query(
            sql.getUserIdAndImg, 
            [req.params.user_id]
        )

        //gestion des erreurs possible :

        if (user.length === 0) {
            return res.status(404).json({
                error : new Error('l\'utilisateur n\'existe pas').message
            })
        }

        if (user[0].id !== req.auth.userId) {
            return res.status(403).json({
                error : new Error('Vous ne disposez pas des droits nécéssaires pour faire cette action !!!').message
            });
        }

        const userObject = req.file ?
            {
                ...JSON.parse(req.body.user), 
                newImg : tool.getImgUrl(req, req.routeConfig.imagePath)
            } : {
                ...req.body, 
                newImg : user[0].imageURL 
            }

        const filename = user[0].imageURL != null ? user[0].imageURL.split('/profile/')[1] : null

        fs.existsSync(`${req.routeConfig.imagePath}/${filename}`)

        if(req.file && filename !== 'defaultProfile.PNG' && filename !== null) { // si l'image n'est pas celle par défault
            
            let filePath = `${req.routeConfig.imagePath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }

        }
        
        await db.promise().query(
            sql.updateUserProfile, 
            [userObject.firstname, userObject.lastname, userObject.email, userObject.position, userObject.newImg, req.params.user_id]
        )

        return res.status(200).json({ message : 'Profil utilisateur mis à jour avec succès !' })
    }

    catch {

        return error => res.status(500).json({error});
    }

}
    

//Suppression d'un user (admin uniquement)
exports.deleteOneUser = (req, res, next) => {

    if (!req.auth.admin) {
        return res.status(403).json({
            error : new Error('Il faut etre administrateur pour pouvoir effectuer cette opération !').message
        })
    }

    db.promise().query(
        'SELECT `id`, `imageURL` FROM `user` WHERE `id` = ?',
        [req.params.user_id]
    )
        .then(([rows]) => {

            const filename = rows[0].imageURL != null ? rows[0].imageURL.split('/profile/')[1] : null

            console.log(filename)

            if(filename === 'defaultProfile.PNG' || filename === null){
            console.log(filename)

                db.promise().query(
                    'DELETE FROM `user` WHERE `id` = ?', 
                    [req.params.user_id]
                )
                    .then(() => res.status(200).json({message : 'Utilisateur supprimé avec succès !'}))
                    .catch(error => res.status(400).json({error}))
            
            } else {

                fs.unlink(`media/profile/${filename}`, () => {
                    db.promise().query(
                        'DELETE FROM `user` WHERE `id` = ?', 
                        [req.params.user_id]
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
        [req.params.user_id]
    )
        .then(([posts]) => res.status(200).json({posts}))
        .catch(error => res.status(500).json({error}));
}
