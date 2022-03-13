const db = require('../config/db');
const tool = require('../config/tool');
const fs = require('fs');


//Recuperation de tous les posts
exports.getAllPosts = async (req, res, next) => {
    try {

        //1. On recupere tous les posts
        let [posts] = await db.promise().query( 
            'SELECT * FROM `post` ORDER BY `date` DESC'
        )
        let postIds = posts.map(post => post.id )

        console.log(postIds)

        //2. On recupere le nombre de like par postId
        let [likes] = await db.promise().query(
            'SELECT `post_id`, COUNT(1) AS countLikes FROM `postlikes` WHERE `post_id` IN ('+postIds.join(',')+') GROUP BY `post_id`'
        )

        // 'SELECT `post_id` FROM `postlikes` WHERE `post_id` IN ('+postIds.join(',')+') AND `userId` = ?', 
        // [req.auth.userId]

        posts = posts.map(post => { // attention ajouter le booleen isliked pour savoir si l'utilisateur a liké
            post.likes = 0;
            for (let like of likes ) {
                if (like.post_id === post.id) {
                    post.likes = like.countLikes
                }
            }

            return post
        })

        return res.status(200).json(posts)
    }
    catch (e) {
        return res.status(500).json({e})
    }
}

//recuperation d'un post
exports.getOnePost = (req, res, next) => {
    db.promise().query(
        'SELECT * FROM `post` WHERE `id`= ?',
        [req.params.post_id]
    )
    .then(([post]) => res.status(200).json(post))
    .catch(error => res.status(400).json({error}))
}

//Post d'un post
exports.postOnePost = (req, res, next) => {

    const postObject = req.file ?
    {
        ...JSON.parse(req.body.post),
        mediaURL : tool.getImgUrl(req, 'post')
    } : {
        ...req.body,
        mediaURL : NULL
    }

    db.promise().query(
        'INSERT INTO `post` (`userId`, `messageText`, `mediaURL`) VALUES (?, ?, ?)',
        [req.auth.userId, postObject.messageText, postObject.mediaURL]
    )
    .then(() => res.status(200).json({message : 'Post enregistré !'}))
    .catch(error => res.status(400).json({error}));
}

//modification d'un post
exports.modifyOnePost = (req, res, next) => {
    db.promise().query(
        'SELECT `userId`, `mediaURL` FROM `post` WHERE `id`= ?', 
        [req.params.post_id]
    )
    .then(([post]) => {

        if(req.auth.userId !== post[0].userId) {
            return res.status(403).json({
                error : new Error('Il n\'est pas possible de modifier le post d\'un autre utilisateur !').message
            })
        }

        const postObject = req.file ?
        {
            ...JSON.parse(req.body.post),
            mediaURL : tool.getImgUrl(req, 'post'),
        } : {
            ...req.body,
            mediaURL : post[0].mediaURL,
        }

        const filename = post[0].mediaURL != null ? post[0].mediaURL.split('/post/')[1] : null

        if(!req.file || filename === null ) {
            db.promise().query(
                'UPDATE `post` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?',
                [postObject.messageText, postObject.mediaURL, req.params.post_id]
            )
            .then(() => res.status(200).json({message : 'Post modifié avec succès !'}))
            .catch(error => res.status(400).json({error}));
        } else {
            fs.unlink(`media/post/${filename}`, () => {
                db.promise().query(
                    'UPDATE `post` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?',
                    [postObject.messageText, postObject.mediaURL, req.params.post_id]
                )
                .then(() => res.status(200).json({message : 'Post modifié avec succès !'}))
                .catch(error => res.status(400).json({error}));
            })
        }

    })
    .catch(error => res.status(500).json({error}));
}

//Suppression d'un post
exports.deleteOnePost = async (req, res, next) => {
    db.promise().query(
        'SELECT `id`, `userId`, `mediaURL` FROM `post` WHERE `id`= ?',
        [req.params.post_id]
    )
    .then(([post]) => {

        if(post[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('Seul le propriétaire du post ou un admin peut supprimer son post').message
            })
        }

        //utilisation du package fs pour supprimer le média lié au post
        const filename = post[0].mediaURL != null ? post[0].mediaURL.split('/post/')[1] : null

        if (filename !== null) {
            // if(false) { 
            //     await fs.unlink(`media/post/${filename}`)
            //  }
            fs.unlink(`media/post/${filename}`, () => {
                db.promise().query(
                    'DELETE FROM `post` WHERE `id`= ?', 
                    [req.params.post_id]
                )
                .then(() => res.status(200).json({message : 'Post supprimé avec succès !'}))
                .catch(error => res.status(400).json({error}));
            })
        } else {
            db.promise().query(
                'DELETE FROM `post` WHERE `id`= ?', 
                [req.params.post_id]
            )
            .then(() => res.status(200).json({message : 'Post supprimé avec succès !'}))
            .catch(error => res.status(400).json({error}));
        }
    }) 
    .catch(error => res.status(500).json({error}));
}

//Like ou delike
exports.like = (req, res, next) => {
    db.promise().query(
        'SELECT `postlikes`.`userId` FROM `postlikes` JOIN `post` ON `postlikes`.`post_id` = `post`.`id` WHERE `post`.`id` = ? AND `postlikes`.`userId` = ?',
        [req.params.post_id, req.auth.userId]
    )
    .then(([userLike]) => {

        if(req.body.like === 0) { // si suppression d'un like
        
            if(userLike.length === 0) { // Si l'utilisateur n'avait pas liké

                return res.status(400).json({
                    error : new Error('Aucun like à supprimer !').message
                })

            } else {
                
                db.promise().query(
                    'DELETE FROM `postlikes` WHERE `userId` = ? AND `post_id`= ?',
                    [req.auth.userId, req.params.post_id]
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
                    'INSERT INTO `postlikes` (`userId`, `post_id`) VALUES (?, ?)', 
                    [req.auth.userId, req.params.post_id]
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
        'SELECT `userId` FROM `postlikes` WHERE `post_id` = ?', 
        [req.params.post_id]
    )
    .then(([userLike]) => {
        const LikesCount = userLike.length
        res.status(200).json({LikesCount})
    })
    .catch((error) => res.status(500).json(error));
}

