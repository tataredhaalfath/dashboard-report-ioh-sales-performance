const app = require("express").Router();
const Auth = require("../controller/authController");
const Dashboard = require("../controller/dashbaordController");
const Performance = require("../controller/performanceController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  res.locals.session = req.user;
  next();
});

app.get("/", Dashboard.index);
app.get("/performance", Performance.index);

// API
app.get("/performance/datatable", Performance.dataTable);
app.post(
  "/performance/import",
  multerUpload.single("file_csv"),
  Performance.importPerformance
);
app.delete("/performance/delete", Performance.destroy);

module.exports = app;
