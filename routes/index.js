const app = require("express").Router();
const Auth = require("../controller/authController");
const Dashboard = require("../controller/dashbaordController");

app.get("/login", Auth.index);
app.post("/login/auth", Auth.userLogin);
app.get("/logout", Auth.logout);

app.use(Auth.checkAuth);

app.get("/", Dashboard.index);

module.exports = app;
