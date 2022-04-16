const multer = require('multer');

const MIME_TYPES = {
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
        const fileType = file.mimetype.split('/')[0];;
        if(fileType !== 'video' && fileType !== 'image'){
            req.fileValidationError = "Type de fichier non valide"
            return cb(null, false, req.fileValidationError);
        }
        cb(null, true);
        console.log('bon fichier')
    }
}).single('file')

exports.fileControl = (req, res, next) => {
    if(req.fileValidationError) {
        return res.status(404).json({
            error : new Error('Format de fichier non valide !').message
        })
    }
    next()
}