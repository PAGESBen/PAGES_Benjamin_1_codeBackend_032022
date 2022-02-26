const db = require('../config/db');
const fs = require('fs');

const generateImgUrl = (req) => {
    return `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
}