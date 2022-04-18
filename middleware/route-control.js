const db = require('../config/db');

//Add req.routeConfig for next middlewares and controllers

exports.userRoute = (req, res, next) => {

    const route = 'user';
    const mediaPath = 'media/profile';
    req.routeConfig = {route, mediaPath};
    
    next()
}

exports.postRoute = (req, res, next) => {

    const route = 'post';
    const mediaPath = 'media/post';
    req.routeConfig = {route, mediaPath}
    next()
}

exports.commentRoute = (req, res, next) => {

    const route = 'comment';
    const mediaPath = 'media/comment';
    req.routeConfig = {route, mediaPath}

    next()
    
}