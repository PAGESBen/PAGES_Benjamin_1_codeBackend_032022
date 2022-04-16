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

// //ajout fileValidation
// const fileValidation = multer({
//     fileFilter: (req, file, cb) => {
//         const extension = file.mimetype.split('/')[0];
//         if(extension !== 'video' && extension !== 'image'){
//             return cb(new Error('Mauvais format de fichier !').message, false);
//         }
//         cb(null, true);
//     }
// });
// //fin

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

module.exports = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, cb) {
        const fileType = file.mimetype.split('/')[0];;
        if(fileType !== 'video' && fileType !== 'image'){
            console.log('pas le bon fichier')
            return cb(new Error('Mauvais format de fichier !').message, false);
        }
        cb(null, true);
        console.log('bon fichier')
    }
}).single('file')

//Date.now est un time stamps (à la miliseconde) qui permet de rendre le fichier unique

// module.exports = multer({upload}).single('file');
