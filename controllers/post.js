const db = require('../config/db');
const sql = require('../config/sqlRequest');
const tool = require('../config/tool');
const fs = require('fs');


//Get posts
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
                error : new Error('Post not found !')
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

//Add on post
exports.postOnePost = (req, res, next) => {

    if(!req.file && req.body.messageText ==='' ){
        return res.status(400).json({
            error : new Error('Post is empty !')
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
    .then(() => res.status(200).json({message : 'Post added with success !'}))
    .catch(error => res.status(500).json({error}));
}

//modify
exports.modifyOnePost = async (req, res, next) => {
   try {
        
        const [post] = await db.promise().query(
            sql.getPostUserIdAndImg, 
            [req.params.post_id]
        )

        //Error
        if(post.length === 0) {
            return res.status(404).json({
                error : new Error('Post not found').message
            })
        }

        if(req.auth.userId !== post[0].userId) {
            return res.status(403).json({
                error : new Error('only owner can modify a post!').message
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
                error : new Error('Post is empty !').message
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

        return res.status(200).json({message : 'Post modified with success !'})
   }
   catch (error) {
       return res.status(500).json({error})
   }
}

//Delete
exports.deleteOnePost = async (req, res, next) => {
    try {
        const [post] = await db.promise().query(
            sql.getPostUserIdAndImg,
            [req.params.post_id]
        )

        if(post.length === 0) {
            return res.status(404).json({
                error : new Error('Post not found !').message
            })
        }

        if(post[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('only available for admin or owner').message
            })
        }

        //delete media file
        const filename = post[0].mediaURL != null ? post[0].mediaURL.split('/post/')[1] : null

        if(filename !== null) {
            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }
        }

        const [relatedMedia] = await db.promise().query(
            sql.getPostRelatedMedia,
            [req.params.post_id]
        )

        //delete on cascade of related comment(s) media(s)
        for(let media of relatedMedia) {
            let relatedfilename = media.mediaURL != null ? media.mediaURL.split('/comment/')[1] : null
            if(relatedfilename !== null) {
                let relatedFilePath = `${req.routeConfig.relatedMediaPath}/${relatedfilename}`
                console.log('relatedFilePath')
                if(fs.existsSync(relatedFilePath)) {
                    await fs.unlinkSync(relatedFilePath)
                }
            }
        }

        await db.promise().query(
            sql.deleteOnePost, 
            [req.params.post_id]
        )

        return res.status(200).json({message : 'Post deleted with sucess!'})
    }
    catch (error) {
        return res.status(500).json({error})
    }

}

//Add or remove like
exports.like = (req, res, next) => {
    db.promise().query(
        sql.getUserPostLike,
        [req.params.post_id, req.auth.userId]
    )
    .then(([userLike]) => {

        if(req.body.like === 0) { // if delete like
        
            if(userLike.length === 0) { // if like is not found

                return res.status(404).json({
                    error : new Error('like not found !').message
                })

            } else {
                
                db.promise().query(
                    sql.deletePostLike,
                    [req.auth.userId, req.params.post_id]
                )
                .then(() => res.status(200).json({message : 'Like deleted with success !'}))
                .catch(error => res.status(500).json(error));
            }
        }

        if(req.body.like === 1) { // if like

            if(userLike.length !== 0) { // if already liked
                res.status(403).json({
                    error : new Error('Post already liked !').message
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