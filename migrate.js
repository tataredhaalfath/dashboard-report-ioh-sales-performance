require("dotenv").config();
const db = require("./models");

db.sequelize
  .sync({ alter: true })
  .then(() => console.log("Migration Success"))
  .catch((err) => console.log("Migration Error :", err))
  .finally(() => process.exit(0));
