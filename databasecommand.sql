CREATE DATABASE groupomania; 

USE groupomania; 

CREATE TABLE user (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE, 
    password VARCHAR(2000) NOT NULL,
    imageURL VARCHAR(100) DEFAULT **************,
    position VARCHAR(100),
    admin BOOLEAN DEFAULT false
);

************* ajouter un utilisateur **************

INSERT INTO `user` (`firstname`, `lastname`, `email`, `password`, `position`)
VALUES
('Jeremy', 'ZUNINO', 'jzunino@gmail.com', 'test1', 'développeur');

************* modifier un utilisateur **************

UPDATE `user`
SET
`firstname` = 'Jerem', 
`email` = 'jerem@gmail.com'
WHERE
`id` = '1';

*************************************



CREATE TABLE post (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId INTEGER, 
    messageText VARCHAR(1000), 
    mediaURL VARCHAR(100),
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

*************creer un post************************

INSERT INTO `post` (`userId`, `messageText`, `mediaURL`)
VALUES
();





CREATE TABLE postLikes (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    userId INTEGER,
    post_id INTEGER NOT NULL
);

//Lien avec la TABLE post : 
ALTER TABLE postlikes
ADD FOREIGN KEY (post_id) REFERENCES post (id)
ON DELETE CASCADE;


CREATE TABLE comment (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId INTEGER NOT NULL,
    messageText VARCHAR(1000), 
    mediaURL VARCHAR(100),
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

//lien avec la table post 
ALTER TABLE comment ADD FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE;

CREATE TABLE private (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    senderId INTEGER NOT NULL,
    recipientId INTEGER NOT NULL,
    messageText VARCHAR(1000), 
    mediaURL VARCHAR(100),
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commentLikes (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    userId INTEGER,
    commentId INTEGER
);

======liaison avec les comments
ALTER TABLE commentlikes
ADD FOREIGN KEY (comment_id) REFERENCES comment (id)
ON DELETE CASCADE;



*****************UTILISATEUR TEST **************
amandine / test5
test / test6
test2 / test6

******************************************-------------------***************************
ALTER TABLE `table enfant`

ADD FOREIGN KEY (`famille_id`) REFERENCES `table parent` (`id`)

ON DELETE CASCADE;




************************

CREATE OR REPLACE VIEW get_all_posts_view AS 
SELECT post.id, post.userId, post.messageText, post.mediaURL, post.date, count(plikes.id) likesCounts, COUNT(mylikes.id) mylikes
FROM `post` post
LEFT JOIN postlikes plikes ON post.id = plikes.post_id
LEFT JOIN postlikes mylikes ON post.id = mylikes.post_id AND mylikes.userId = 6 AND mylikes.id = plikes.id
GROUP BY post.id, post.userId, post.messageText, post.mediaURL, post.date

PAGINATION
SELECT * 
FROM get_all_posts_view
WHERE date < ? 
ORDER BY date DESC 
LIMIT ?