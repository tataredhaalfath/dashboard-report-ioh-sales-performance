require("dotenv").config();
const {
  DEV_DB_HOST,
  DEV_DB_NAME,
  DEV_DB_PASSWORD,
  DEV_DB_USERNAME,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_USERNAME,
} = process.env;

module.exports = {
  development: {
    username: DEV_DB_USERNAME,
    password: DEV_DB_PASSWORD,
    database: DEV_DB_NAME,
    host: DEV_DB_HOST,
    dialect: "mysql",
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "mysql",
  },
};
