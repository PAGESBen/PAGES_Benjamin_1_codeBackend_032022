const req = require("express/lib/request")

module.exports = 
  {
    //USER
    createUser : 'INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `imageURL`, `position`) VALUES (?, ?, ?, ?, ?, ?)',
    getUserByMail : 'SELECT `id`, `password` FROM `user` WHERE `email` = ?',
    getUserProfil : 'SELECT `id`, `firstname`, `lastname`, `email`, `imageURL`, `position`  FROM `user` WHERE `id` =?',
    getUserId : 'SELECT `id` FROM `user` WHERE `id` = ?',
    getUserIdAndImg : 'SELECT `id`, `imageURL` FROM `user` WHERE `id` = ?',
    updateUserProfile : 'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?',
    deleteUser : 'DELETE FROM `user` WHERE `id` = ?',
    postsCount : 'SELECT COUNT(1) count FROM `post`',
    getUserPosts : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(DISTINCT `plikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` WHERE `post`.`userId` = ? GROUP BY `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
    
    //POSTS
    getAllPosts : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(DISTINCT `plikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` GROUP BY `post`.`id` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
    getOnePost : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, COUNT(DISTINCT plikes.`id`) likesCounts, COUNT(DISTINCT mylikes.`id`) isliked, COUNT(DISTINCT comment.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = plikes.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = plikes.`post_id` AND mylikes.`userId` = ? AND plikes.`id` = mylikes.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` WHERE `post`.`id` = ? GROUP BY `post`.`id`;',
    postOnePost : 'INSERT INTO `post` (`userId`, `messageText`, `mediaURL`) VALUES (?, ?, ?)',
    getPostUserIdAndImg : 'SELECT `userId`, `mediaURL` FROM `post` WHERE `id`= ?',
    updateOnePost : 'UPDATE `post` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?',
    deleteOnePost : 'DELETE FROM `post` WHERE `id`= ?', 

    //COMMENTS
    getAllCommentsByPostId : 'SELECT `comment`.`id`, `comment`.`userId`, `comment`.`messageText`, `comment`.`mediaURL`, `comment`.`date`, count(DISTINCT `clikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes FROM `comment` comment LEFT JOIN `commentlikes` clikes ON `comment`.`id` = `clikes`.`comment_id` LEFT JOIN `commentlikes` mylikes ON `comment`.`id` = `mylikes`.`comment_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `clikes`.`id` WHERE `comment`.`post_id` = ? GROUP BY `comment`.`id` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
    postOneComment : 'INSERT INTO `comment` (`userId`, `messageText`, `mediaURL`, `post_id`) VALUES (?, ?, ?, ?)',
    commentsCount : 'SELECT COUNT(1) count FROM `comment`', 
    getCommentUserIdAndImg : 'SELECT `userId`, `mediaURL` FROM `comment` WHERE `id`= ?', 
    modifyOneComment : 'UPDATE `comment` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?', 
    deleteOneComment : 'DELETE FROM `comment` WHERE `id`= ?'

  }

