const { User, Division } = require("../models");

const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require("bcrypt");
const { signin, verify } = require("../middleware/jwt");
module.exports = {
  index: async (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/");
    }
    res.render("pages/login", {
      title: "Login",
    });
  },

  userLogin: async (req, res, next) => {
    try {
      const source = req.body;
      const schema = {
        email: "email|empty:false",
        password: "string|empty:false",
      };

      const validate = v.compile(schema)(req.body);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      const user = await User.findOne({
        where: {
          email: source.email,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      const isValidPass = await bcrypt.compare(source.password, user.password);
      if (!isValidPass) {
        return res.status(400).json({
          status: "error",
          message: "Password tidak sesuai",
        });
      }

      let token = await signin({ id: user.id });
      req.session.user = token;
      req.session.save();

      return res.json({
        status: "success",
        message: "Login Sukses",
        token: token,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  checkAuth: async (req, res, next) => {
    if (req.session.user) {
      let verified = await verify(req.session.user);
      if (!verified) {
        req.session.destroy();
        return res.redirect("/login");
      } else {
        const user = await User.findOne({
          attributes: ["id", "email", "division_id"],
          include: {
            attributes: ["id", "name"],
            model: Division,
          },
          where: {
            id: verified.id,
          },
        });

        if (!user) {
          return res.redirect("/login");
        }

        req.user = JSON.parse(JSON.stringify(user));
        return next();
      }
    } else {
      return res.redirect("/login");
    }
  },

  logout: async (req, res, next) => {
    req.session.destroy();
    res.redirect("/login");
  },
};
