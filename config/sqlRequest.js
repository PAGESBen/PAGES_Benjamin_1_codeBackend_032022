const req = require("express/lib/request")

module.exports = 
  {
    createUser : 'INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `imageURL`, `position`) VALUES (?, ?, ?, ?, ?, ?)',
    getUserByMail : 'SELECT `id`, `password` FROM `user` WHERE `email` = ?',
    getUserProfil : 'SELECT `id`, `firstname`, `lastname`, `email`, `imageURL`, `position`  FROM `user` WHERE `id` =?',
    getUserId : 'SELECT `id` FROM `user` WHERE `id` = ?',
    getUserIdAndImg : 'SELECT `id`, `imageURL` FROM `user` WHERE `id` = ?',
    updateUserProfile : 'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?',
    deleteUser : 'DELETE FROM `user` WHERE `id` = ?',
    postsCount : 'SELECT COUNT(1) count FROM `post`',
    getUserPosts : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(`plikes`.`id`) likesCounts, COUNT(`mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` WHERE `post`.`userId` = ? GROUP BY `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
      //attention offset doit etre calculé par le Front = (numéro de page -1) * limite
    getAllPosts : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, count(`plikes`.`id`) likesCounts, COUNT(`mylikes`.`id`) mylikes, COUNT(DISTINCT `comment`.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = `plikes`.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = `mylikes`.`post_id` AND `mylikes`.`userId` = ? AND `mylikes`.`id` = `plikes`.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` GROUP BY `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date` ORDER BY `date` DESC LIMIT ? OFFSET ?;',
    getOnePost : 'SELECT `post`.`id`, `post`.`userId`, `post`.`messageText`, `post`.`mediaURL`, `post`.`date`, COUNT(DISTINCT plikes.`id`) likesCounts, COUNT(mylikes.`id`) isliked, COUNT(DISTINCT comment.`id`) comments FROM `post` post LEFT JOIN `postlikes` plikes ON `post`.`id` = plikes.`post_id` LEFT JOIN `postlikes` mylikes ON `post`.`id` = plikes.`post_id` AND mylikes.`userId` = ? AND plikes.`id` = mylikes.`id` LEFT JOIN `comment` comment ON `post`.`id` = comment.`post_id` WHERE `post`.`id` = ? GROUP BY `post`.`id`;'
  }

// [req.auth.userId, req.params.user_id, req.params.limit, req.params.offset]
// [req.auth.userId, req.params.limit, req.params.offset]
// [req.auth.userId, req.params.post_id]