module.exports = {
    
    getImgUrl : (req, path, defaultName) => {
        return `${req.protocol}://${req.get('host')}/images/${path}/${defaultName ? defaultName : req.file.filename}`
    }, 

    error : {
        userNotFound : new Error('user not found !')
    }

}