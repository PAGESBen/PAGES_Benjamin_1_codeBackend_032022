const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.userSignup /*fonction signup*/);
router.post('/login', userCtrl.userLogin /*fonction login*/);

router.get('/', async () => {

    // create the connection to database //Connexion à la base de données My Sql
    const connection = await mysql.createConnection({
        host: process.env.BASE_HOST,
        user: process.env.BASE_USER,
        password : process.env.BASE_PASSWORD,
        database: process.env.DATABASE
    });

    //Requete à placer dans le controler
    const [rows] = await connection.query(
        'SELECT * FROM `user` WHERE `email` = ?',
        ["jzunino@gmail.com"] // sécurité : requête préparée
    );
    
    console.log(rows);// results contains rows returned by server // remplacer par Json.stringift
})

module.exports = router;

