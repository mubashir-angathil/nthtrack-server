const dotenv = require("dotenv");

// Env path configuration
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// destruct env variables
const {
  PORT,
  NODE_ENV,
  DATABASE,
  DATABASE_USER_NAME,
  DATABASE_PASSWORD,
  HOST,
  DIALECT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = process.env;

module.exports = {
  PORT,
  NODE_ENV,
  HOST,
  DIALECT,
  DATABASE,
  DATABASE_USER_NAME,
  DATABASE_PASSWORD,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
