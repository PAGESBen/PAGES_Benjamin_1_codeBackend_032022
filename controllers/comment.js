const db = require('../config/db');
const fs = require('fs');
const tool = require('../config/tool');
const { get } = require('express/lib/response');



//Récuperation des commentaires d'un post
exports.getComment = (req, res, next) => {
    db.promise().query(
        'SELECT * FROM comment WHERE post_id = ?', 
        [req.params.id]
    )
    .then(([comments]) => res.status(200).json({comments}))
    .catch(error => res.status(500).json({error}));
}

//Ajout d'un commentaire sur un post
exports.postComment = (req, res, next) => {

    const commentObject = req.file ?
    {
        ...JSON.parse(req.body.comment),
        mediaURL : tool.getImgUrl(req, 'comment'),
    } : {
        ...req.body,
        mediaURL : NULL,
    }

    db.promise().query(
        'INSERT INTO `comment` (`userId`, `messageText`, `mediaURL`, `post_id`) VALUES (?, ?, ?, ?)',
        [req.auth.userId, commentObject.messageText, commentObject.mediaURL, req.params.id]
    )
    .then(() => res.status(200).json({message : 'Commentaire enregistré !'}))
    .catch(error => res.status(400).json({error}));
}

//Modification d'un commentaire
exports.modifyOnecomment = (req, res, next) => {
    db.promise().query(
        'SELECT `userId`, `mediaURL` FROM `comment` WHERE `id`= ?', 
        [req.params.id]
    )
    .then(([comment]) => {
    
        if(!comment[0]){
            return res.status(400).json({
                error : new Error('Commentaire introuvable !').message
            })
        }

        if(req.auth.userId !== comment[0].userId) {
            return res.status(403).json({
                error : new Error('Il n\'est pas possible de modifier le commentaire d\'un autre utilisateur !').message
            })
        }

        const commentObject = req.file ?
        {
            ...JSON.parse(req.body.comment),
            mediaURL : tool.getImgUrl(req, 'comment')
        } : {
            ...req.body,
            mediaURL : comment[0].mediaURL
        }

        db.promise().query(
            'UPDATE `comment` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?',
            [commentObject.messageText, commentObject.mediaURL, req.params.id]
        )
        .then(() => res.status(200).json({message : 'Commentaire modifié avec succès !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
}

//Suppression d'un Commentaire
exports.deleteOneComment = (req, res, next) => {
    db.promise().query(
        'SELECT `id`, `userId`, `mediaURL` FROM `comment` WHERE `id`= ?',
        [req.params.id]
    )
    .then(([comment]) => {

        if(!comment[0]) {
            return res.status(400).json({
                error : new Error('Commentaire introuvable !').message
            })
        }

        if(comment[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('Seul le propriétaire du commentaire ou un admin peut supprimer un commentaire').message
            })
        }

        //utilisation du package fs pour supprimer le média lié au commentaire
        const filename = comment[0].mediaURL.split('/images/')[1]
        fs.unlink(`images/${filename}`, () => {
            db.promise().query(
                'DELETE FROM `comment` WHERE `id`= ?', 
                [req.params.id]
            )
            .then(() => res.status(200).json({message : 'Commentaire supprimé avec succès !'}))
            .catch(error => res.status(400).json({error}));
        })
    }) 
    .catch(error => res.status(500).json({error}));
}

//Ajout d'un like sur un commentaire
//Like ou delike
exports.like = (req, res, next) => {
    db.promise().query(
        'SELECT `userId` FROM `commentlikes` WHERE `comment_id` = ? AND `userId` = ?',
        [req.params.id, req.auth.userId]
    )
    .then(([userLike]) => {

        if(req.body.like === 0) { // si suppression d'un like
        
            if(userLike.length === 0) { // Si l'utilisateur n'avait pas liké

                return res.status(400).json({
                    error : new Error('Aucun like à supprimer !').message
                })

            } else {
                
                db.promise().query(
                    'DELETE FROM `commentlikes` WHERE `userId` = ? AND `comment_id`= ?',
                    [req.auth.userId, req.params.id]
                )
                .then(() => res.status(200).json({message : 'Like supprimé !'}))
                .catch(error => res.status(500).json(error));
            }
        }

        if(req.body.like === 1) { // si il s'agit d'un like

            if(userLike.length !== 0) { // si il y a déjà un like
                res.status(403).json({
                    error : new Error('Il n\'est pas possible de liker 2 fois le même post !').message
                })
            } else {
                db.promise().query(
                    'INSERT INTO `commentlikes` (`userId`, `comment_id`) VALUES (?, ?)', 
                    [req.auth.userId, req.params.id]
                )
                .then(() => res.status(200).json({message : 'Like enregistré avec succès !'}))
                .catch(error => res.status(500).json({error}));
            }
        }
    })
    .catch(error => res.status(500).json({error}));
}

//Récuperation du nombre de like d'un post 
exports.likes = (req, res, next) => {
    db.promise().query(
        'SELECT `userId` FROM `commentlikes` WHERE `comment_id` = ?', 
        [req.params.id]
    )
    .then(([userLike]) => {
        const LikesCount = userLike.length
        res.status(200).json({LikesCount})
    })
    .catch((error) => res.status(500).json(error));
}