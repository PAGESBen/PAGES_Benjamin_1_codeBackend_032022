const db = require('../config/db');
const fs = require('fs');
const { NULL } = require('mysql/lib/protocol/constants/types');

const generateMediaUrl = (req) => {
    return `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
}

//Recuperation de tous les posts
exports.getAllPosts = (req, res, next) => {
    db.promise().query(
        'SELECT * FROM `post`'
    )
    .then(([posts]) => res.status(200).json(posts))
    .catch(error => res.status(400).json({error}));
}

//recuperation d'un post
exports.getOnePost = (req, res, next) => {
    db.promise().query(
        'SELECT * FROM `post` WHERE `id`= ?', 
        [req.params.id]
    )
    .then( ([post]) => res.status(200).json(post))
    .catch(error => res.status(400).json({error}))
}

//Post d'un post
exports.postOnePost = (req, res, next) => {

    const postObject = req.file ?
    {
        ...JSON.parse(req.body.post),
        mediaURL : generateMediaUrl(req),
        likes : 0
    } : {
        ...req.body,
        mediaURL : NULL,
        likes : 0
    }

    db.promise().query(
        'INSERT INTO `post` (`userId`, `messageText`, `mediaURL`, `likes`) VALUES (?, ?, ?, ?)',
        [req.auth.userId, postObject.messageText, postObject.mediaURL, postObject.likes]
    )
    .then(() => res.status(200).json({message : 'Post enregistré !'}))
    .catch(error => res.status(400).json({error}));
}

//modification d'un post
exports.modifyOnePost = (req, res, next) => {
    db.promise().query(
        'SELECT `userId`, `mediaURL` FROM `post` WHERE `id`= ?', 
        [req.params.id]
    )
    .then(([post]) => {
    
        if(!post[0]){
            return res.status(400).json({
                error : new Error('Post introuvable !').message
            })
        }

        if(req.auth.userId !== post[0].userId) {
            return res.status(403).json({
                error : new Error('Il n\'est pas possible de modifier le post d\'un autre utilisateur !').message
            })
        }

        const postObject = req.file ?
        {
            ...JSON.parse(req.body.post),
            mediaURL : generateMediaUrl(req),
        } : {
            ...req.body,
            mediaURL : post[0].mediaURL,
        }

        db.promise().query(
            'UPDATE `post` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?',
            [postObject.messageText, postObject.mediaURL, req.params.id]
        )
        .then(() => res.status(200).json({message : 'Post modifié avec succès !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
}

exports.deleteOnePost = (req, res, next) => {
    db.promise().query(
        'SELECT `id`, `userId` FROM `post` WHERE `id`= ?',
        [req.params.id]
    )
    .then(([post]) => {

        if(!post[0]) {
            return res.status(400).json({
                error : new Error('Post introuvable !').message
            })
        }

        if(post[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('Seul le propriétaire du post ou un admin peut supprimer son post').message
            })
        }

        db.promise().query(
            'DELETE FROM `post` WHERE `id`= ?', 
            [req.params.id]
        )
        .then(() => res.status(200).json({message : 'Post supprimé avec succès !'}))
        .catch(error => res.status(400).json({error}));
    }) 
    .catch(error => res.status(500).json({error}));
}