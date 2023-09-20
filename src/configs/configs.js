const dotenv = require('dotenv');

// Env path configuration
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

// destruct env variables 
const { PORT, NODE_ENV, DATABASE, DATABASE_USER_NAME, DATABASE_PASSWORD, HOST, DIALECT } = process.env

module.exports = {
    PORT,
    NODE_ENV,
    HOST,
    DIALECT,
    DATABASE,
    DATABASE_USER_NAME,
    DATABASE_PASSWORD
}

// {
//     "development": {
//       "username": "root",
//       "password": null,
//       "database": "database_development",
//       "host": "127.0.0.1",
//       "dialect": "mysql"
//     },
//     "test": {
//       "username": "root",
//       "password": null,
//       "database": "database_test",
//       "host": "127.0.0.1",
//       "dialect": "mysql"
//     },
//     "production": {
//       "username": "root",
//       "password": null,
//       "database": "database_production",
//       "host": "127.0.0.1",
//       "dialect": "mysql"
//     }
//   }
  