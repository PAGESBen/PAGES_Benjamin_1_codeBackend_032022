const db = require('../config/db');
const sql = require('../config/sqlRequest');
const tool = require('../config/tool');
const fs = require('fs');


//Recuperation de tous les posts
exports.getAllPosts = async (req, res, next) => {
    try {
        let [postsCount] = await db.promise().query(
            sql.postsCount, 
            [req.params.user_id]
        )
        
        const pagesCount = Math.ceil(postsCount[0].count / req.params.limit)
        let offset = (req.params.page - 1) * req.params.limit

       let [postsList] = await db.promise().query(
           sql.getAllPosts,
           [req.auth.userId, Number(req.params.limit), offset]
       )

        let mediaType = null
        let posts = []
        for(let post of postsList) {

            mediaType = post.mediaURL === null ? null : tool.getMediaType(post.mediaURL)
            
            post = {
                ...post, 
                mediaType
            }

            posts.push(post)
        }

        return res.status(200).json({
            postsCount : postsCount[0].count, 
            pagesCount, 
            posts
        })
    }
    catch (e) {
        return res.status(500).json({e})
    }
}

//recuperation d'un post
exports.getOnePost = async (req, res, next) => {
    try {
        let [singlePost] = await db.promise().query(
            sql.getOnePost,
            [req.auth.userId, req.params.post_id]
        )

        if (singlePost.length === 0) {
            return res.status(404).json({
                error : new Error('Post introuvable !')
            })
        }

        let mediaType = singlePost[0].mediaURL === null ? null : tool.getMediaType(singlePost[0].mediaURL)

        const post = {
            ...singlePost[0],
            mediaType
        }

        return res.status(200).json(post)
    }
    catch {
        return res.status(500).json({error})
    }

}

//Post d'un post
exports.postOnePost = (req, res, next) => {

    if(!req.file && req.body.messageText ==='' ){
        return res.status(400).json({
            error : new Error('Le post est vide !')
        })
    }

    const postObject = req.file ?
    {
        ...JSON.parse(req.body.post),
        mediaURL : tool.getImgUrl(req, req.routeConfig.mediaPath)
    } : {
        ...req.body,
        mediaURL : null
    }

    db.promise().query(
        sql.postOnePost,
        [req.auth.userId, postObject.messageText, postObject.mediaURL]
    )
    .then(() => res.status(200).json({message : 'Post enregistré !'}))
    .catch(error => res.status(500).json({error}));
}

//modification d'un post
exports.modifyOnePost = async (req, res, next) => {
   try {
        
        const [post] = await db.promise().query(
            sql.getPostUserIdAndImg, 
            [req.params.post_id]
        )

        //gestion des erreur
        if(post.length === 0) {
            return res.status(404).json({
                error : new Error('Le post n\'existe pas').message
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
            mediaURL : tool.getImgUrl(req, req.routeConfig.mediaPath)
        } : {
            ...req.body,
            mediaURL : post[0].mediaURL
        }

        if(req.body.removeImg) {
            postObject.mediaURL = null
        }

        if(postObject.messageText == '' && postObject.mediaURL == null) {
            return res.status(400).json({
                error : new Error('Impossible de supprimer tout le contenu d\'un post !').message
            })
        }

        const filename = post[0].mediaURL != null ? post[0].mediaURL.split('/post/')[1] : null

        if((req.file || req.body.removeImg) && filename !== null) {
            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }
        }

        db.promise().query(
            sql.updateOnePost,
            [postObject.messageText, postObject.mediaURL, req.params.post_id]
        )

        return res.status(200).json({message : 'Post modifié avec succès !'})

   }
   catch (error) {
       return res.status(500).json({error})
   }
}

//Suppression d'un post
exports.deleteOnePost = async (req, res, next) => {
    try {
        const [post] = await db.promise().query(
            sql.getPostUserIdAndImg,
            [req.params.post_id]
        )

        if(post.length === 0) {
            return res.status(404).json({
                error : new Error('Post introuvable !').message
            })
        }

        if(post[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('Seul le propriétaire du post ou un admin peut supprimer son post').message
            })
        }

        //utilisation du package fs pour supprimer le média lié au post
        const filename = post[0].mediaURL != null ? post[0].mediaURL.split('/post/')[1] : null

        if(filename !== null) { // si l'image n'est pas celle par défault
            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }
        }

        await db.promise().query(
            sql.deleteOnePost, 
            [req.params.post_id]
        )

        return res.status(200).json({message : 'Post supprimé!'})
    }
    catch (error) {
        return res.status(500).json({error})
    }

}

//Like ou delike
exports.like = (req, res, next) => {
    db.promise().query(
        sql.getUserPostLike,
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
                    sql.deletePostLike,
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
                    sql.postPostLike, 
                    [req.auth.userId, req.params.post_id]
                )
                .then(() => res.status(200).json({message : 'Like enregistré avec succès !'}))
                .catch(error => res.status(500).json({error}));
            }
        }
    })
    .catch(error => res.status(500).json({error}));
}