module.exports = 
    {
        createUser : 'INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `imageURL`, `position`) VALUES (?, ?, ?, ?, ?, ?)',
        getUserByMail : 'SELECT `id`, `password` FROM `user` WHERE `email` = ?',
        getUserProfil : 'SELECT `id`, `firstname`, `lastname`, `email`, `imageURL`, `position`  FROM `user` WHERE `id` =?',
        getUserIdAndImg : 'SELECT `id`, `imageURL` FROM `user` WHERE `id` = ?',
        updateUserProfile : 'UPDATE `user` SET `firstname` = ?, `lastname` = ?, `email` = ?, `position` = ?, `imageURL` = ? WHERE `id` = ?',
        deleteUser : 'DELETE FROM `user` WHERE `id` = ?',
        getAllPosts : 'SELECT `post.id`, `post.userId`, post.messageText, post.mediaURL, post.date, count(plikes.id) likesCounts, COUNT(mylikes.id) mylikes FROM `post` post LEFT JOIN postlikes plikes ON post.id = plikes.post_id LEFT JOIN postlikes mylikes ON post.id = mylikes.post_id AND mylikes.userId = ? AND mylikes.id = plikes.id GROUP BY post.id, post.userId, post.messageText, post.mediaURL, post.date ORDER BY `date` DESC;'
    }