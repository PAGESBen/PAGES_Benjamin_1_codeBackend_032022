const db = require('../config/db');

//Controles des paramètres des req, des formats des images / vidéos, passafe des paths pour le stockage des médias

exports.userRoute = (req, res, next) => {

    const route = 'user';
    const imagePath = 'media/profile';
    req.routeConfig = {route, imagePath};

    //si id user dans les paramètres alors on va verifier que l'utilisateur existe
    if(req.params.user_id) {
        db.promise().query(
            'SELECT `id` FROM `user` WHERE `id` = ?',
            [req.params.user_id]
        )
            .then(([user]) => {
                if (user.length === 0) {
                    return res.status(404).json({
                        error : new Error('Utilisateur introuvable !').message
                    })
                }
            })
            .catch(error => res.status(500).json({error})) //!jeremy : return est il obligatoire pour arreter la fonction sur cette erreur
    }

    next()
}

exports.postRoute = (req, res, next) => {

    const route = 'post';
    const imagePath = 'media/post';
    req.routeConfig = {route, imagePath}

    if(req.params.post_id) {
        db.promise().query(
            'SELECT `id` FROM `post` WHERE `id` = ?',
            [req.params.post_id]
        )
            .then(([post]) => {
                if (post.length === 0) {
                    return res.status(404).json({
                        error : new Error('Post introuvable !').message
                    })
                }
            })
            .catch(error => res.status(500).json({error}))
    }

    next()
}

exports.commentRoute = (req, res, next) => {

    const route = 'comment';
    const imagePath = 'media/comment' 
    req.routeConfig = {route, imagePath}

    if(req.params.post_id) {
        db.promise().query(
            'SELECT `id` FROM `post` WHERE `id` = ?',
            [req.params.post_id]
        )
            .then(([post]) => {
                if (post.length === 0) {
                    return res.status(404).json({
                        error : new Error('Post introuvable !').message
                    })
                }
            })
            .catch(error => res.status(500).json({error}))
    }


    if(req.params.comment_id) {
        db.promise().query(
            'SELECT `id` FROM `comment` WHERE `id` = ?',
            [req.params.comment_id]
        )
            .then(([comment]) => {
                if (comment.length === 0) {
                    return res.status(404).json({
                        error : new Error('Commentaire introuvable !').message
                    })
                }
            })
            .catch(error => res.status(500).json({error}))
    }


    next()
    
}