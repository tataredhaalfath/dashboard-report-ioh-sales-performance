const { Division } = require("../models");

const Validator = require("fastest-validator");
const v = new Validator();
module.exports = {
  index: async (req, res, next) => {
    return res.render("pages/division", { title: "Divisi" });
  },

  dataTable: async (req, res, next) => {
    let where = {};
    if (req.query.search["value"]) {
      where.name = req.query.search["value"];
    }

    const offsetLimit = {
      offset: parseInt(req.query.start),
      limit: parseInt(req.query.length),
    };
    const totalData = await Division.count();
    Division.findAll({
      ...offsetLimit,
      attributes: ["id", "name"],
      where,
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
      let division = await Division.findOne({
        attributes: ["id", "name"],
        where: { id },
      });
      if (!division) {
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });
      }

      return res.json({
        status: "success",
        data: division,
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
      const schema = {
        name: "string|empty:false",
      };

      const validate = v.compile(schema)(req.body);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      let name = req.body.name;
      await Division.create({ name });
      return res.json({
        status: "success",
        message: "Data berhasil ditambahkan",
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
      const schema = {
        id: "string|empty:false",
        name: "string|empty:false",
      };

      const validate = v.compile(schema)(req.body);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate[0].message,
        });
      }

      let id = req.body.id;
      let name = req.body.name;

      let division = await Division.findOne({ where: { id } });
      if (!division) {
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });
      }

      await division.update({ name });
      return res.json({
        status: "success",
        message: "Data berhasil diperbarui",
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

      let division = await Division.findOne({ where: { id } });
      if (!division) {
        return res.status(404).json({
          status: "error",  
          message: "Data tidak ditasdadsd emukan",
        });
      }

      await division.destroy();
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
};
