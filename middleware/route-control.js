const db = require('../config/db');

//Add req.routeConfig for next middlewares and controllers

exports.userRoute = (req, res, next) => {

    const route = 'user';
    const mediaPath = 'media/profile';
    const relatedMediaPath = 'media/post';
    const relatedMediaPath2 = 'media/comment';
    req.routeConfig = {route, mediaPath, relatedMediaPath, relatedMediaPath2};
    
    next()
}

exports.postRoute = (req, res, next) => {

    const route = 'post';
    const mediaPath = 'media/post';
    const relatedMediaPath = 'media/comment'
    req.routeConfig = {route, mediaPath, relatedMediaPath}
    next()
}

exports.commentRoute = (req, res, next) => {

    const route = 'comment';
    const mediaPath = 'media/comment';
    req.routeConfig = {route, mediaPath}

    next()
    
}