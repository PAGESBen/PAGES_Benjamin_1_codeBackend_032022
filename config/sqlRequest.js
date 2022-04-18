const req = require("express/lib/request")

module.exports = 
  {
    //ADMIN
    admin : 'SELECT `admin` FROM `user` WHERE `id`= ?',
    //USER
    createUser : 'INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `imageURL`, `position`) VALUES (?, ?, ?, ?, ?, ?)',
    getUserByMail : 'SELECT `id`, `password`, `admin` FROM `user` WHERE `email` = ?',
    getUserProfil : 'SELECT `id`, `firstname`, `lastname`, `email`, `imageURL`, `position`  FROM `user` WHERE `id` =?',
    getUserId : 'SELECT `id` FROM `user` WHERE `id` = ?',
    getUserIdAndImg : 'SELECT `id`, `imageURL` FROM `user` WHERE `id` = ?',
    updateUserProfile : 'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?',
    deleteUser : 'DELETE FROM `user` WHERE `id` = ?',
    postsCount : 'SELECT COUNT(1) count FROM `post`',
    getUserPosts : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(DISTINCT `plikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` WHERE `post`.`userId` = ? GROUP BY `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
    
    //POSTS
    getAllPosts : 'SELECT `post`.`id`, `post`.`userId`, `user`.`firstname`, `user`.`lastname`, `user`.`imageURL` userImg, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(DISTINCT `plikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` LEFT JOIN `user` user ON `post`.`userId` = `user`.`id` GROUP BY `post`.`id` ORDER BY `date` DESC LIMIT ? OFFSET ?',
    getOnePost : 'SELECT `post`.`id`, `post`.`userId`, `user`.`firstname`, `user`.`lastname`, `user`.`imageURL` userImg, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(DISTINCT `plikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` LEFT JOIN `user` user ON `post`.`userId` = `user`.`id` WHERE `post`.`id` = ? GROUP BY `post`.`id`;',
    postOnePost : 'INSERT INTO `post` (`userId`, `messageText`, `mediaURL`) VALUES (?, ?, ?)',
    getPostUserIdAndImg : 'SELECT `userId`, `mediaURL` FROM `post` WHERE `id`= ?',
    updateOnePost : 'UPDATE `post` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?',
    deleteOnePost : 'DELETE FROM `post` WHERE `id`= ?',
    getUserPostLike : 'SELECT userId FROM postlikes WHERE post_id = ? AND userId = ?',
    deletePostLike : 'DELETE FROM `postlikes` WHERE `userId` = ? AND `post_id`= ?',
    postPostLike : 'INSERT INTO `postlikes` (`userId`, `post_id`) VALUES (?, ?)',

    //COMMENTS
    getAllCommentsByPostId : 'SELECT `comment`.`id`, `comment`.`userId`, `user`.`firstname`, `user`.`lastname`, `user`.`imageURL` userImg, `comment`.`messageText`, `comment`.`mediaURL`, `comment`.`date`, count(DISTINCT `clikes`.`id`) likesCounts, COUNT(DISTINCT `mylikes`.`id`) mylikes FROM `comment` comment LEFT JOIN `commentlikes` clikes ON `comment`.`id` = `clikes`.`comment_id` LEFT JOIN `commentlikes` mylikes ON `comment`.`id` = `mylikes`.`comment_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `clikes`.`id` LEFT JOIN `user` user ON `comment`.`userId` = `user`.`id` WHERE `comment`.`post_id` = ? GROUP BY `comment`.`id` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
    postOneComment : 'INSERT INTO `comment` (`userId`, `messageText`, `mediaURL`, `post_id`) VALUES (?, ?, ?, ?)',
    commentsCount : 'SELECT COUNT(1) count FROM `comment`', 
    getCommentUserIdAndImg : 'SELECT `userId`, `mediaURL` FROM `comment` WHERE `id`= ?', 
    modifyOneComment : 'UPDATE `comment` SET `messageText` = ?, `mediaURL`=? WHERE `id`= ?', 
    deleteOneComment : 'DELETE FROM `comment` WHERE `id`= ?',
    getUserCommentLike : 'SELECT userId FROM commentlikes WHERE comment_id = ? AND userId = ?',
    deleteCommentLike : 'DELETE FROM `commentlikes` WHERE `userId` = ? AND `comment_id`= ?',
    postCommentLike : 'INSERT INTO `commentlikes` (`userId`, `comment_id`) VALUES (?, ?)'

  }

