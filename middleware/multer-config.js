const multer = require('multer');

const MIME_TYPES = { //supported files
    'image/jpg' : 'jpg', 
    'image/jpeg' : 'jpg',
    'image/png' : 'png',
    'image/bmp' : 'bpm',
    'image/gif' : 'gif',
    'video/mp4' : 'mp4',
    'video/mpeg' : 'mpeg',
    'video/x-msvideo' : 'avi',
};

const storage = multer.diskStorage({

    destination: (req, file, callback) => {
        callback(null, req.routeConfig.mediaPath)
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

exports.upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, cb) {
        const fileType = file.mimetype.split('/')[0];
        if(MIME_TYPES[file.mimetype] == undefined && ((req.routeConfig.route === 'user' && fileType !== 'image') || (req.routeConfig.route !=='user' && fileType !== 'video' && fileType !== 'image'))){
            req.fileValidationError = "Type de fichier non valide"
            return cb(null, false, req.fileValidationError);
        }
        cb(null, true);
    }
}).single('file')

exports.fileControl = (req, res, next) => {
    if(req.fileValidationError) {
        return res.status(400).json({
            error : new Error('Unsupported file extension').message
        })
    }
    next()
}