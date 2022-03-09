module.exports = {
    
    getImgUrl : (req, path, defaultName) => {
        return `${req.protocol}://${req.get('host')}/media/${path}/${defaultName ? defaultName : req.file.filename}`
    }, 
}