const res = require("express/lib/response")

module.exports = {
    
    getImgUrl : (req, path, defaultName) => {
        return `${req.protocol}://${req.get('host')}/${path}/${defaultName ? defaultName : req.file.filename}`
    },
    getMediaType : function (fileName) {
        let video = ['mpeg', 'mp4', 'avi']
        let image = ['jpg', 'jpeg', 'bmp', 'png']
        let gif =  ['gif']

        if(fileName === null) {
            return null
        } else {
            if(video.indexOf(fileName.split('.').pop()) != -1 ) {
                return 'video'
            } else if (image.indexOf(fileName.split('.').pop()) != -1) {
                return 'image'
            } else if (gif.indexOf(fileName.split('.').pop()) != -1) {
                return 'gif'
            } else {
                return null
            }
        }
    }
}