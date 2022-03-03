//Importation d'express pour les middleware et de Mongoose pour MongoDB
const express = require('express');
const { cp } = require('fs');
const path = require('path'); //permet de recuperer l'URL pour les images ligne 29

// Constante app avec express
const app = express()

//Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');

//Sécurité : CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images'))); //permet à l'app d'aller chercher les images dans le dossier image

app.use('/api', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/post', commentRoutes);

// Exportation de l'app
module.exports = app