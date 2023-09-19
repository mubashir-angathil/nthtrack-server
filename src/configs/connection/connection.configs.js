const mysql = require('mysql2')
const {
    DATABASE,
    DATABASE_PASSWORD,
    DATABASE_USER_NAME,
    HOST
} = require("../configs")

// Create new database connection
const connection = mysql.createConnection({
    host: HOST,
    user: DATABASE_USER_NAME,
    password: DATABASE_PASSWORD,
    // database: DATABASE
})

// Connect
const connect = () => {
    return connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('✅ Connected to MySQL database !!');
    });
}

module.exports = {
    connection,
    connect
}