const { User, Division } = require("../models");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require("bcrypt");
const csvtojson = require("csvtojson/v2");
module.exports = {
  index: async (req, res, next) => {
    let divisions = await Division.findAll({ attributes: ["id", "name"] });
    return res.render("pages/user", { title: "User", divisions });
  },

  dataTable: async (req, res, next) => {
    let { division } = req.query;
    let where = {};
    let whereDivision = {};
    if (req.query.search["value"]) {
      where.email = {
        [Op.like]: `%${req.query.search["value"]}%`,
      };
    }

    if (division && division != "all") {
      whereDivision.name = {
        [Op.like]: `%${division}%`,
      };
    }

    const offsetLimit = {
      offset: parseInt(req.query.start),
      limit: parseInt(req.query.length),
    };

    const totalData = await User.count({
      where,
      include: {
        model: Division,
        where: {
          ...whereDivision,
        },
      },
    });
    User.findAll({
      ...offsetLimit,
      attributes: ["id", "email"],
      where,
      include: {
        attributes: ["id", "name"],
        model: Division,
        where: {
          ...whereDivision,
        },
      },
      order: [["id", "desc"]],
    }).then((result) => {
      result = JSON.parse(JSON.stringify(result));
      let output = result.map((item) => {
        let action = `<div class='dropdown-primary dropdown open'>
                          <button class='btn btn-sm btn-primary dropdown-toggle waves-effect waves-light' id='dropdown-${item.id}' data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                              Aksi
                          </button>
                          <div class='dropdown-menu' aria-labelledby="dropdown-${item.id}" data-dropdown-out='fadeOut'>
                              <a class='dropdown-item' onclick='return getData("${item.id}");' href='javascript:void(0)' title='Edit'>Edit</a>
                              <a class='dropdown-item' onclick='return removeData("${item.id}");' href='javascript:void(0)' title='Remove'>Hapus</a>
                          </div>
                      </div>`;
        item.action = action;
        return item;
      });

      return res.json({
        draw: req.query.draw,
        recordsFiltered: totalData,
        recordsTotal: totalData,
        data: output,
      });
    });
  },

  getDetail: async (req, res, next) => {
    try {
      let id = req.params.id;
      let user = await User.findOne({
        attributes: ["id", "email", "division_id"],
        where: { id },
      });
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });
      }

      return res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  create: async (req, res, next) => {
    try {
      let source = req.body;
      const schema = {
        email: "email|empty:false",
        password: "string|empty:false|min:5",
        division_id: "string|empty:false",
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      const checkUser = await User.findOne({
        where: {
          email: source.email,
        },
      });

      if (checkUser) {
        return res.status(400).json({
          status: "error",
          message: "Email sudah digunakan",
        });
      }

      const checkDivisin = await Division.findOne({
        where: { id: source.division_id },
      });

      if (!checkDivisin) {
        return res.status(404).json({
          status: "error",
          message: "Divisi tidak ditemukan",
        });
      }

      source.password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(2));

      await User.create({
        email: source.email,
        password: source.password,
        division_id: checkDivisin.id,
      });
      return res.json({
        status: "success",
        message: "Data User berhasil ditambahkan",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  update: async (req, res, next) => {
    try {
      let source = req.body;
      const schema = {
        id: "string|empty:false",
        email: "email|empty:false",
        division_id: "string|empty:false",
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      const checkUser = await User.findOne({
        attributes: ["id", "email", "division_id"],
        where: {
          id: source.id,
        },
      });

      if (!checkUser) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      const checkDivisin = await Division.findOne({
        where: { id: source.division_id },
      });

      if (!checkDivisin) {
        return res.status(404).json({
          status: "error",
          message: "Divisi tidak ditemukan",
        });
      }

      if (checkUser.email !== source.email) {
        let checkEmailExist = await User.findOne({
          where: {
            email: source.email,
            id: {
              [Op.not]: checkUser.id,
            },
          },
        });

        if (checkEmailExist) {
          return res.status(400).json({
            status: "error",
            message: "Email sudah digunakan",
          });
        }
      }

      if (source.password) {
        source.password = bcrypt.hashSync(
          source.password,
          bcrypt.genSaltSync(2)
        );
      }

      await checkUser.update(source);
      return res.json({
        status: "success",
        message: "Data User berhasil diperbarui",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  destroy: async (req, res, next) => {
    try {
      const schema = {
        id: "string|empty:false",
      };

      const validate = v.compile(schema)(req.body);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      let id = req.body.id;

      let user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });
      }

      await user.destroy();
      return res.json({
        status: "success",
        message: "Data berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  importUser: async (req, res, next) => {
    try {
      let file = req.file;
      if (!file)
        return res
          .status(400)
          .json({ status: "error", message: "File harus di upload!" });

      if (req.file.mimetype != "text/csv")
        return res.status(400).json({
          status: "error",
          message: "Tipe file upload harus .csv",
        });

      let arrayJson = await csvtojson().fromFile(file.path);
      arrayJson = arrayJson.map((arr) => {
        return {
          email: arr.Username,
          password: bcrypt.hashSync(arr.Password, bcrypt.genSaltSync(2)),
          division: arr["Position Job Title"],
        };
      });

      for (const item of arrayJson) {
        let checkDivision = await Division.findOne({
          where: { name: item.division },
        });

        let checkUser = await User.findOne({
          where: {
            email: item.email,
          },
        });

        if (!checkUser && checkDivision) {
          User.create({
            email: item.email,
            password: item.password,
            division_id: checkDivision.id,
          })
            .then(res)
            .catch((err) => console.log("Err :", err.message));
        }
      }

      return res.json({
        status: "success",
        message: "Sukses Import Data User",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
};
