const { User, Division } = require("../models");
const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require("bcrypt");

module.exports = {
  index: async (req, res, next) => {
    let title = "Settings";
    let email = req.user.email;
    let division = req.user.Division.name;
    return res.render("pages/setting", { title, email, division });
  },

  update: async (req, res, next) => {
    try {
      let id = req.user.id;
      let email = req.user.email;
      let body = req.body;

      const schema = {
        password: "string|empty:false",
        newPassword: "string|min:5|empty:false",
        confirmPassword: "string|min:5|empty:false",
      };

      const validate = v.compile(schema)(req.body);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      if (body.newPassword != body.confirmPassword) {
        return res.status(400).json({
          status: "error",
          message: "Password Konfirmasi tidak sesuai",
        });
      }

      const user = await User.findOne({
        where: {
          id,
          email,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      const isValidPass = await bcrypt.compare(
        body.password,
        user.password
      );
      
      if (!isValidPass) {
        return res.status(400).json({
          status: "error",
          message: "Password lama tidak sesuai",
        });
      }

      await user.update({
        password: bcrypt.hashSync(body.newPassword, bcrypt.genSaltSync(2)),
      });

      return res.json({
        status: "success",
        message: "Data account berhasil diperbarui",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
};
