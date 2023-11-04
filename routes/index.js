const app = require("express").Router();
const Auth = require("../controller/authController");
const Dashboard = require("../controller/dashbaordController");
const Performance = require("../controller/performanceController");

app.get("/login", Auth.index);
app.post("/login/auth", Auth.userLogin);
app.get("/logout", Auth.logout);

app.use(Auth.checkAuth);
app.use(function (req, res, next) {
  res.locals.session = req.user;
  next();
});

app.get("/", Dashboard.index);
app.get("/performance", Performance.index);

// API
app.get("/performance/datatable", Performance.dataTable);
module.exports = app;
