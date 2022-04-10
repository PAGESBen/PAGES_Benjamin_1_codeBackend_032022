const db = require('../config/db');
const fs = require('fs');
const tool = require('../config/tool');
const sql = require('../config/sqlRequest');


//Récuperation des commentaires d'un post
exports.getComment = async (req, res, next) => {

    try{

        const [commentsCount] = await db.promise().query(
            sql.commentsCount + 'WHERE `post_id` = ?'
            [req.params.post_id]
        )



        const pagesCount = Math.ceil(commentsCount[0].count / req.params.limit)
        let offset = (req.params.page - 1) * req.params.limit

        let [comments] = await db.promise().query(
            sql.getAllCommentsByPostId,
            [req.auth.userId, req.params.post_id, Number(req.params.limit), offset]
        )

        return res.status(200).json({
            commentsCount : commentsCount[0].count,
            pagesCount,
            comments
        })

    }
    catch(error){
        return res.status(200).json({error})
    }
}

//Ajout d'un commentaire sur un post
exports.postComment = (req, res, next) => {

    if(!req.file && req.body.messageText ==='' ){
        return res.status(400).json({
            error : new Error('Le post est vide !')
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
    .then(() => res.status(200).json({message : 'Commentaire enregistré !'}))
    .catch(error => res.status(400).json({error}));
}

//Modification d'un commentaire
exports.modifyOnecomment = async (req, res, next) => {
    try {

    const [comment] = await db.promise().query(
        sql.getCommentUserIdAndImg, 
        [req.params.comment_id]
    )

    if(comment.length === 0) {
        return res.status(404).json({
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
        mediaURL : tool.getImgUrl(req, req.routeConfig.mediaPath)
    } : {
        ...req.body,
        mediaURL : comment[0].mediaURL
    }

    //logique de suppression de l'image
    const filename = comment[0].mediaURL != null ? comment[0].mediaURL.split('/comment/')[1] : null

    if(req.file && filename !== null) {
        let filePath = `${req.routeConfig.mediaPath}/${filename}`
        if(fs.existsSync(filePath)) {
            await fs.unlinkSync(filePath)
        }
    }

    await db.promise().query(
        sql.modifyOneComment,
        [commentObject.messageText, commentObject.mediaURL, req.params.comment_id]
    )

    return res.status(200).json({message : 'commentaire modifié avec succès !'})

    } catch (error) {
        return res.status(500).json({error})        
    }
}

//Suppression d'un Commentaire
exports.deleteOneComment = async (req, res, next) => {

    try {
        
        const [comment] = await db.promise().query(
            sql.getCommentUserIdAndImg,
            [req.params.comment_id]
        )
        if(comment.length === 0) {
            return res.status(400).json({
                error : new Error('Commentaire introuvable !').message
            })
        }

        if(comment[0].userId !== req.auth.userId && !req.auth.admin) {
            return res.status(403).json({
                error : new Error('Seul le propriétaire du commentaire ou un admin peut supprimer un commentaire').message
            })
        }


        //logique de suppression de l'image
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

        return res.status(200).json({message : 'Commentaire supprimé !'})

    }
    catch (error) {
        return res.status(500).json({error})
    }

}

//Ajout d'un like sur un commentaire
//Like ou delike
exports.like = (req, res, next) => {
    db.promise().query(
        'SELECT `userId` FROM `commentlikes` WHERE `comment_id` = ? AND `userId` = ?',
        [req.params.comment_id, req.auth.userId]
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
                    [req.auth.userId, req.params.comment_id]
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
                    [req.auth.userId, req.params.comment_id]
                )
                .then(() => res.status(200).json({message : 'Like enregistré avec succès !'}))
                .catch(error => res.status(500).json({error}));
            }
        }
    })
    .catch(error => res.status(500).json({error}));
}