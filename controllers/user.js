const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('../config/sqlRequest');
const tool = require('../config/tool');
const fs = require('fs');

//User creation
exports.userSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then( hash => {

            const imageURL = tool.getImgUrl(req, req.routeConfig.mediaPath, 'defaultProfile.PNG')

            db.promise().query(
                sql.createUser,
                [req.body.firstname, req.body.lastname, req.body.email, hash, imageURL, req.body.position] // sécurité : requête préparée
            )
                .then(() => res.status(201).json({message : "utilisateur créé avec succès !"}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}))
};

//User Login
exports.userLogin = (req, res, next) => {
    db.promise().query(
        sql.getUserByMail, 
        [req.body.email]
    )
        .then(([rows]) => {
            if (!rows[0]) {
                return res.status(404).json({
                    error : new Error('Mail not found !').message
                })
            }
            bcrypt.compare(req.body.password, rows[0].password)
                .then(valid => {
                    if (!valid){
                        return res.status(401).json({ message : 'Invalid password !' })
                    }
                    res.status(200).json({
                        userId : rows[0].id,
                        token : jwt.sign(
                            { userId : rows[0].id }, 
                            process.env.TOKEN_KEY,
                            { expiresIn : '24h' }
                        ), 
                        admin : rows[0].admin
                    });
                })
                .catch(error => res.status(500).json({error}));
            })
            .catch(error => res.status(500).json({error}));

}

//Get user Profile
exports.getOneUser = (req, res, next) => {
    db.promise().query(
        sql.getUserProfil, 
        [req.params.user_id]
        )
        .then(([user]) => {

            if (user.length === 0) {
                return res.status(404).json({
                    error : new Error('User not found').message
                })
            }

            res.status(200).json(user[0])
        })
        .catch((error) => res.status(500).json({error}));
}

//Modify profile
exports.modifyOneUser = async (req, res, next) => {

    try{
        const [user] = await db.promise().query(
            sql.getUserIdAndImg, 
            [req.params.user_id]
        )

        //Error :
        if (user.length === 0) {
            return res.status(404).json({
                error : new Error('user not found').message
            })
        }

        if (user[0].id !== req.auth.userId) {
            return res.status(403).json({
                error : new Error('Only owner can modify profile').message
            });
        }

        const userObject = req.file ?
            {
                ...JSON.parse(req.body.user), 
                imageURL : tool.getImgUrl(req, req.routeConfig.mediaPath)
            } : {
                ...req.body, 
                imageURL : user[0].imageURL 
            }

        const filename = user[0].imageURL != null ? user[0].imageURL.split('/profile/')[1] : null

        if(req.file && filename !== 'defaultProfile.PNG' && filename !== null) { // If profile Img is the default Img
            
            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            }
        }
        
        await db.promise().query(
            sql.updateUserProfile, 
            [userObject.firstname, userObject.lastname, userObject.email, userObject.position, userObject.imageURL, req.params.user_id]
        )
        return res.status(200).json({ ...userObject, id : req.params.user_id })
    }
    catch (error) {
        return res.status(500).json({error});
    }

}

//Delete user
exports.deleteOneUser = async (req, res, next) => {

    try {
        if (!req.auth.admin && req.auth.userId != req.params.user_id) {
            return res.status(403).json({
                error : new Error('Only available for admin or owner').message
            })
        }

        const [user] = await db.promise().query(
            sql.getUserIdAndImg,
            [req.params.user_id]
        )

        if (user.length === 0) {
            return res.status(404).json({
                error : new Error('User not found').message
            })
        }

        const filename = user[0].imageURL != null ? user[0].imageURL.split('/profile/')[1] : null

        if(filename !== 'defaultProfile.PNG' && filename !== null) {

            let filePath = `${req.routeConfig.mediaPath}/${filename}`
            if(fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath)
            
            }
        }

        const [relatedMedia] = await db.promise().query(
            sql.getUserRelatedMedia,
            [req.params.user_id]
        )

        //delete on cascade of related post(s) media(s)
        for(let media of relatedMedia) {
            let relatedfilename = media.mediaURL != null ? media.mediaURL.split('/post/')[1] : null
            if(relatedfilename !== null) {
                let relatedFilePath = `${req.routeConfig.relatedMediaPath}/${relatedfilename}`
                if(fs.existsSync(relatedFilePath)) {
                    await fs.unlinkSync(relatedFilePath)
                }
            }
        }

        const [relatedMedia2] = await db.promise().query(
            sql.getUserRelatedMedia2,
            [req.params.user_id]
        )

        //delete on cascade of related comment(s) media(s)
        for(let media of relatedMedia2) {
            let relatedfilename2 = media.mediaURL != null ? media.mediaURL.split('/comment/')[1] : null
            if(relatedfilename2 !== null) {
                let relatedFilePath2 = `${req.routeConfig.relatedMediaPath2}/${relatedfilename2}`
                if(fs.existsSync(relatedFilePath2)) {
                    await fs.unlinkSync(relatedFilePath2)
                }
            }
        }

        await db.promise().query(
            sql.deleteUser,
            [req.params.user_id]
        )

        return res.status(200).json({message : 'User deleted with success'})
    
    } catch (error) {
        return res.status(500).json({error})
    }

}

// get all user Posts
exports.getUserPosts = async (req, res, next) => {

    try{
        const [user] = await db.promise().query(
            sql.getUserId,
            [req.params.user_id]
        )

        if(user.length === 0) {
            return res.status(404).json({
                error : new Error('User not found').message
            })
        }

        let [postsCount] = await db.promise().query(
            sql.postsCount + 'WHERE `userId` = ?', 
            [req.params.user_id]
        )

        const pagesCount = Math.ceil(postsCount[0].count / req.params.limit)
        
        let offset = (req.params.page - 1) * req.params.limit

        let [posts] = await db.promise().query(
            sql.getUserPosts, 
            [req.auth.userId, req.params.user_id, Number(req.params.limit), offset]
        )

        return res.status(200).json({
            postsCount : postsCount[0].count, 
            pagesCount, 
            posts
        })
    }

    catch (error) {
        res.status(500).json({error})
    }
}
