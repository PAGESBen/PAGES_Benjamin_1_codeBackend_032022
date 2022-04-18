const db = require('../config/db');
const fs = require('fs');
const tool = require('../config/tool');
const sql = require('../config/sqlRequest');


//get comments by post id
exports.getComment = async (req, res, next) => {

    try{

        const [commentsCount] = await db.promise().query(
            sql.commentsCount + 'WHERE post_id = ?',
            [req.params.post_id]
        )

        const pagesCount = Math.ceil(commentsCount[0].count / req.params.limit)
        let offset = (req.params.page - 1) * req.params.limit

        let [commentsList] = await db.promise().query(
            sql.getAllCommentsByPostId,
            [req.auth.userId, req.params.post_id, Number(req.params.limit), offset]
        )
        
        let mediaType = null
        let comments = []

        for(let comment of commentsList) {
            mediaType = comment.mediaURL === null ? null : tool.getMediaType(comment.mediaURL)
        
            comment = {
                ...comment, 
                mediaType
            }

            comments.push(comment)
        }
        
        return res.status(200).json({
            commentsCount : commentsCount[0].count,
            pagesCount,
            comments
        })

    }
    catch(error){
        return res.status(500).json({error})
    }
}

//Add one comment
exports.postComment = (req, res, next) => {

    if(!req.file && req.body.messageText ==='' ){
        return res.status(400).json({
            error : new Error('Empty post !')
        })
    }

    const commentObject = req.file ?
    {
        ...JSON.parse(req.body.comment),
        mediaURL : tool.getImgUrl(req, req.routeConfig.mediaPath),
    } : {
        ...req.body,
        mediaURL : null,
    }

    db.promise().query(
        sql.postOneComment,
        [req.auth.userId, commentObject.messageText, commentObject.mediaURL, req.params.post_id]
    )
    .then(() => res.status(200).json({message : 'Post with success'}))
    .catch(error => res.status(500).json({error}));
}

//Modify one comment
exports.modifyOnecomment = async (req, res, next) => {
    try {

        const [comment] = await db.promise().query(
            sql.getCommentUserIdAndImg, 
            [req.params.comment_id]
        )

        if(comment.length === 0) {
            return res.status(404).json({
                error : new Error('Comment not found !').message
            })
        }
        
        if(req.auth.userId !== comment[0].userId) {
            return res.status(403).json({
                error : new Error('Only owner can modify a comment').message
            })
        }

        const commentObject = req.file ?
        {
            ...JSON.parse(req.body.comment),
            mediaURL : tool.getImgUrl(req, req.routeConfig.mediaPath)
        } : {
            ...req.body,
            mediaURL : comment[0].mediaURL
        }

        if(req.body.removeImg) {
            commentObject.mediaURL = null
        }

        if(commentObject.messageText == '' && commentObject.mediaURL == null) {
            return res.status(400).json({
                error : new Error('A comment can\'t be empty').message
            })
        }

        //Remove previous media file if change or delete
        const filename = comment[0].mediaURL != null ? comment[0].mediaURL.split('/comment/')[1] : null

        if((req.file || req.body.removeImg) && filename !== null) {
            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }
        }

        await db.promise().query(
            sql.modifyOneComment,
            [commentObject.messageText, commentObject.mediaURL, req.params.comment_id]
        )

        return res.status(200).json({message : 'Comment modified with success'})

    } catch (error) {
        return res.status(500).json({error})        
    }
}

//Delete
exports.deleteOneComment = async (req, res, next) => {

    try {
        
        const [comment] = await db.promise().query(
            sql.getCommentUserIdAndImg,
            [req.params.comment_id]
        )
        if(comment.length === 0) {
            return res.status(400).json({
                error : new Error('Comment not found !').message
            })
        }

        if(comment[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('Only available for admin or owner').message
            })
        }

        //Delete previous media
        const filename = comment[0].mediaURL != null ? comment[0].mediaURL.split('/comment/')[1] : null

        if(filename !== null) {
            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }
        }

        await db.promise().query(
            sql.deleteOneComment, 
            [req.params.comment_id]
        )

        return res.status(200).json({message : 'Comment deleted with success !'})

    }
    catch (error) {
        return res.status(500).json({error})
    }

}

//Add or delete like
exports.like = (req, res, next) => {
    db.promise().query(
        sql.getUserCommentLike,
        [req.params.comment_id, req.auth.userId]
    )
    .then(([userLike]) => {

        if(req.body.like === 0) { // if delete like
        
            if(userLike.length === 0) { // if like is not found

                return res.status(404).json({
                    error : new Error('Like not found !').message
                })

            } else {
                
                db.promise().query(
                    sql.deleteCommentLike,
                    [req.auth.userId, req.params.comment_id]
                )
                .then(() => res.status(200).json({message : 'Like deleted !'}))
                .catch(error => res.status(500).json(error));
            }
        }

        if(req.body.like === 1) { // if like

            if(userLike.length !== 0) { // if like already exist
                res.status(403).json({
                    error : new Error('comment already liked').message
                })
            } else {
                db.promise().query(
                    sql.postCommentLike, 
                    [req.auth.userId, req.params.comment_id]
                )
                .then(() => res.status(200).json({message : 'Liked with sucess !'}))
                .catch(error => res.status(500).json({error}));
            }
        }
    })
    .catch(error => res.status(500).json({error}));
}