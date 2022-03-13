const res = require("express/lib/response")

module.exports = {
    
    getImgUrl : (req, path, defaultName) => {
        return `${req.protocol}://${req.get('host')}/${path}/${defaultName ? defaultName : req.file.filename}`
    }
}