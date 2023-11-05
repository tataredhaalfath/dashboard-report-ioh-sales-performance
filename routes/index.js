const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = require("express").Router();
const isAdmin = require("../middleware/isAdmin");
const Auth = require("../controller/authController");
const User = require("../controller/usercontroller");
const Division = require("../controller/divisionController");
const Dashboard = require("../controller/dashbaordController");
const Performance = require("../controller/performanceController");

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 20 * 1024 * 1024, //20MB
  },
});

app.get("/login", Auth.index);
app.post("/login/auth", Auth.userLogin);
app.get("/logout", Auth.logout);

app.use(Auth.checkAuth);
app.use(function (req, res, next) {
  console.log("req user :", req.user)
  res.locals.session = req.user;
  next();
});

app.get("/", Dashboard.index);
app.get("/performance", Performance.index);
app.get("/performance/datatable", Performance.dataTable);
app.post(
  "/performance/import",
  multerUpload.single("file_csv"),
  Performance.importPerformance
);
app.delete("/performance/delete", Performance.destroy);

// DIVISION
app.use("/division", isAdmin);
app.get("/division", Division.index);
app.get("/division/datatable", Division.dataTable);
app.get("/division/:id/detail", Division.getDetail);
app.post("/division/create", Division.create);
app.post("/division/update", Division.update);
app.delete("/division/delete", Division.destroy);

// USER
app.use("/user", isAdmin);
app.get("/user", User.index);
app.get("/user/datatable", User.dataTable);
app.get("/user/:id/detail", User.getDetail);
app.post("/user/create", User.create);
app.post("/user/update", User.update);
app.post("/user/import", multerUpload.single("file_csv"), User.importUser);
app.delete("/user/delete", User.destroy);

module.exports = app;
