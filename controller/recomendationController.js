const { User, Division, Learningpath } = require("../models");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Validator = require("fastest-validator");
const v = new Validator();
const configToken = require("../config/token");
const path = require("path");
const fs = require("fs");
module.exports = {
  index: async (req, res, next) => {
    let divisions = await Division.findAll({ attributes: ["id", "name"] });

    return res.render("pages/recomendation", {
      title: "Lerning Path Recomendation",
      divisions,
    });
  },

  dataTable: async (req, res, next) => {
    let { division, email } = req.query;
    let where = {};
    let whereDivision = {};
    if (req.query.search["value"] && req.user.division_id == 1) {
      where = {
        [Op.or]: {
          email: {
            [Op.like]: `%${req.query.search["value"]}%`,
          },
          url: {
            [Op.like]: `%${req.query.search["value"]}%`,
          },
        },
      };
    } else if (req.query.search["value"] && req.user.division_id != 1) {
      where.url = {
        [Op.like]: `%${req.query.search["value"]}%`,
      };
    }

    if (division && division != "all") {
      whereDivision.name = division;
    }

    if (email && email != "") {
      whereDivision.email = email;
    }

    if (req.user.division_id != 1) {
      where.user_id = req.user.id;
    }

    const offsetLimit = {
      offset: parseInt(req.query.start),
      limit: parseInt(req.query.length),
    };
    const totalData = await Learningpath.count();
    Learningpath.findAll({
      ...offsetLimit,
      attributes: ["id", "email", "url", "status", "image", "user_id"],
      where,
      order: [["id", "desc"]],
    }).then((result) => {
      result = JSON.parse(JSON.stringify(result));
      let output = result.map((item) => {
        let action =
          req.user.division_id == 1
            ? `<div class='dropdown-primary dropdown open'>
                          <button class='btn btn-sm btn-primary dropdown-toggle waves-effect waves-light' id='dropdown-${item.id}' data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                              Aksi
                          </button>
                          <div class='dropdown-menu' aria-labelledby="dropdown-${item.id}" data-dropdown-out='fadeOut'>
                          <a class='dropdown-item' onclick='return getData("${item.id}", "detail");' href='javascript:void(0)' title='Detail'>Detail</a>
                          </div>
                      </div>`
            : `<div class='dropdown-primary dropdown open'>
                          <button class='btn btn-sm btn-primary dropdown-toggle waves-effect waves-light' id='dropdown-${item.id}' data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                              Aksi
                          </button>
                          <div class='dropdown-menu' aria-labelledby="dropdown-${item.id}" data-dropdown-out='fadeOut'>
                          <a class='dropdown-item' onclick='return getData("${item.id}", "detail");' href='javascript:void(0)' title='Detail'>Detail</a>
                          <a class='dropdown-item' onclick='return getData("${item.id}", "add");' href='javascript:void(0)' title='Set Completion'>Set Complete</a>
                              <a class='dropdown-item' onclick='return getData("${item.id}", "update");' href='javascript:void(0)' title='Edit Completion'>Edit Completion</a>
                          </div>
                      </div>`;
        item.action = action;
        item.completed = item.image
          ? `<button class='badge badge-success' >
                Completed
            </button>`
          : `<button class='badge badge-warning' >
                UnCompleted
            </button>`;
        if(req.user.division_id == 1){
          item.url = `<p>${item.url}</p>`;
        }else{
          item.url = `<a href="${item.url}" target="_blank" onClick="updateStatus(${item.id})">${item.url}</a>`;
        }
        item.visited =
          item.status == 1
            ? `<button class='badge badge-success' >
                Visited
              </button>`
            : `<button class='badge badge-warning' >
                Not Visited
              </button>`;
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
      let recomendation = await Learningpath.findOne({
        attributes: ["id", "email", "url", "image"],
        where: { id },
      });
      if (!recomendation) {
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });
      }

      recomendation.image = `<img src='/assets/completion/${recomendation.image}' class='img img-thumbnail' width="100%">`;
      return res.json({
        status: "success",
        data: recomendation,
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
      let token = req.headers.token;
      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "You don't have permission",
        });
      }

      if (token != configToken.token) {
        return res.status(400).json({
          status: "error",
          message: "Your token doesn't match",
        });
      }

      let source = req.body;
      const schema = {
        email: "email|empty:false",
        recomendations: "array",
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      for (const item of source.recomendations) {
        let user = await User.findOne({
          attributes: ["id", "email"],
          where: {
            email: source.email,
          },
        });
        if (item != "" && user) {
          Learningpath.create({
            email: user.email,
            url: item,
            status: 0,
            user_id: user.id,
          })
            .then(res)
            .catch((err) => console.log("error create recomendation :", err));
        }
      }

      return res.json({
        status: "success",
        message: "Data Learning Path berhasil ditambahkan",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      let recomendation = await Learningpath.findOne({
        where: { id: req.body.id },
      });

      if (!recomendation) {
        return res.status(404).json({
          status: "error",
          message: "Learning path not found",
        });
      }

      if (recomendation.user_id == req.user.id) {
        await recomendation.update({
          status: 1,
        });
      }

      return res.json({
        status: "success",
        message: "Status berhasil diubah",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  setComplete: async (req, res, next) => {
    try {
      let image = req.file;
      if (!image) {
        return res.status(400).json({
          status: "error",
          message: "Bukti Completion harus di upload!",
        });
      }

      if (!["image/jpg", "image/jpeg", "image/png"].includes(image.mimetype)) {
        return res.status(400).json({
          status: "error",
          message: "Tipe file upload harus .jpg/.jpeg/.png",
        });
      }

      let filename = req.file.filename;

      let checkData = await Learningpath.findOne({
        where: {
          id: req.body.id,
        },
      });

      if (!checkData) {
        return res.status(404).json({
          status: "error",
          message: "Data rekomenasi learning path tidak ditemukan",
        });
      }

      if (checkData.image) {
        fs.unlink(
          path.resolve(
            process.cwd(),
            `public/assets/completion/${checkData.image}`
          ),
          (error) => {
            if (error) {
              console.error("Failed to delete file:", error);
            } else {
              console.log("File deleted successfully");
            }
          }
        );
      }
      await checkData.update({
        image: filename,
        status: 1,
      });

      return res.json({
        status: "success",
        message: "Gambar berhasil disimpan",
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(
          path.resolve(
            process.cwd(),
            `public/assets/completion/${req.filename}`
          ),
          (error) => {
            if (error) {
              console.error("Failed to delete file:", error);
            } else {
              console.log("File deleted successfully");
            }
          }
        );
      }
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
};
