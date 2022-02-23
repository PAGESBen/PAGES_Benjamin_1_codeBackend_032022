const mysql = require("mysql2");

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.BASE_HOST,
  user: process.env.BASE_USER,
  password : process.env.BASE_PASSWORD,
  database: process.env.DATABASE
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;