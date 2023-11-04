const { User, Division } = require("../models");
module.exports = {
  index: async (req, res, next) => {
    res.render("pages/dashboard", {
      title: "Main Dashboard",
    });
  },
};
