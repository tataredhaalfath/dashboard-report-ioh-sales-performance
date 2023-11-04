require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
const env = process.env.NODE_ENV || "development";
const port = process.env.NODE_PORT || 8000;
const routes = require("./routes");

//view engin
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set("x-powered-by", "IOH Team 3");

//middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "ioh team 3",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
// Routing
app.use(routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`app running on [${env}] environment on port : ${port}`);
});
module.exports = app;
