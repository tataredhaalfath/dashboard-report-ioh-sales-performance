const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = require("express").Router();
const isAdmin = require("../middleware/isAdmin");
const Auth = require("../controller/authController");
const User = require("../controller/usercontroller");
const Setting = require("../controller/settingController");
const Division = require("../controller/divisionController");
const Dashboard = require("../controller/dashbaordController");
const Performance = require("../controller/performanceController");
const Recomendation = require("../controller/recomendationController");
const SalesPerformance = require("../controller/salesPerformanceController");

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

const uploadCompletionDir = path.resolve(
  process.cwd(),
  "public/assets/completion"
);
if (!fs.existsSync(uploadCompletionDir)) {
  fs.mkdirSync(uploadCompletionDir, { recursive: true });
}
const multerUploadCompletion = multer({
  storage: multer.diskStorage({
    destination: uploadCompletionDir,
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName =
        file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop();
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

app.get("/login", Auth.index);
app.post("/login/auth", Auth.userLogin);
app.get("/logout", Auth.logout);
app.post("/api/recomendation/create", Recomendation.create);

app.use(Auth.checkAuth);
app.use(function (req, res, next) {
  res.locals.session = req.user;
  next();
});

app.get("/", Dashboard.index);
app.get("/stat/multiline-chart", Dashboard.multipleLineChart);
app.get("/stat/line-chart", Dashboard.lineChart);
app.get("/stat/pie-chart", Dashboard.pieChart);
app.get("/stat/bar-chart", Dashboard.barChart);

//PERFORMANCE
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

// SALES PERFORMANCE
app.use("/sales-performance", isAdmin);
app.get("/sales-performance", SalesPerformance.index);
app.get("/sales-performance/get-users", SalesPerformance.getUsers);
app.get("/sales-performance/line-chart", SalesPerformance.lineChart);
app.get("/sales-performance/bar-chart", SalesPerformance.barChart);

// LEARNING PATH RECOMENDATION
app.get("/recomendation", Recomendation.index);
app.get("/recomendation/datatable", Recomendation.dataTable);
app.get("/recomendation/:id/detail", Recomendation.getDetail);
app.post(
  "/recomendation/complete",
  multerUploadCompletion.single("image"),
  Recomendation.setComplete
);
app.post("/recomendation/update-status", Recomendation.updateStatus);

// SETTINGS
app.get("/setting", Setting.index);
app.post("/setting/account/update", Setting.update);

module.exports = app;
