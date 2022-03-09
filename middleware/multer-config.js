const multer = require('multer');

const MIME_TYPES = {
    'image/jpg' : 'jpg', 
    'image/jpeg' : 'jpg',
    'image/png' : 'png',
    'image/gif' : 'gif'
};

const storage = multer.diskStorage({
    
    // fileFilter : (req, file, callback) => {
    //     if(file.mimetype === 'image/jpg')
    // },

    destination: (req, file, callback) => {
        callback(null, req.routeConfig.imagePath)
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

//Date.now est un time stamps (à la miliseconde) qui permet de rendre le fichier unique

module.exports = multer({storage}).single('file');