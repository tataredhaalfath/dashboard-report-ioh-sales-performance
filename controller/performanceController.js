const moment = require("moment");
const { Performance, Division } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const _ = require("underscore");
const csvtojson = require("csvtojson/v2");

module.exports = {
  index: async (req, res, next) => {
    let divisions = await Division.findAll({ attributes: ["id", "name"] });
    return res.render("pages/performance", { title: "Data Performa", divisions });
  },

  dataTable: async (req, res, next) => {
    let { start_date, end_date, division, email } = req.query;
    let filterDate = {};

    if (!start_date) {
      filterDate.start_date = moment().startOf("month").format("YYYY-MM-DD");
    }

    if (!end_date) {
      filterDate.end_date = moment().endOf("month").format("YYYY-MM-DD");
    }

    if (start_date && end_date) {
      filterDate.start_date = moment(start_date, "DD-MM-YYYY")
        .startOf("days")
        .add(7, "hours")
        .toDate();
      filterDate.end_date = moment(end_date, "DD-MM-YYYY")
        .endOf("days")
        .add(7, "hours")
        .toDate();
    }

    let where = {
      createdAt: {
        [Op.gte]: moment
          .utc(filterDate.start_date)
          .format("YYYY-MM-DD HH:mm:ss"),
        [Op.lte]: moment.utc(filterDate.end_date).format("YYYY-MM-DD HH:mm:ss"),
      },
    };

    if (req.user.division_id != 1) {
      where.email = req.user.email;
    }

    if (division && division != "all") {
      where.position = division;
    }

    if (email) {
      where.email = email;
    }

    if (req.user.division_id == 1 && req.query.search["value"]) {
      where.email = {
        [Op.like]: `%${req.query.search["value"]}%`,
      };
    }

    const totalData = await Performance.count({
      where,
    });
    const offsetLimit = {
      offset: parseInt(req.query.start),
      limit: parseInt(req.query.length),
    };

    Performance.findAll({
      ...offsetLimit,
      attributes: [
        "id",
        "email",
        "position",
        "average",
        "sales_performance",
        "performance_score",
        "flight_risk",
        "achivement",
        "directorate_name",
        "location_group",
        "createdAt",
      ],
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
                              <a class='dropdown-item' onclick='return removeData("${item.id}");' href='javascript:void(0)' title='Remove'>Hapus</a>
                          </div>
                      </div>`
            : `<div class='dropdown-primary dropdown open'>
                          <button class='btn btn-sm btn-primary dropdown-toggle waves-effect waves-light' id='dropdown-${item.id}' data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                              Aksi
                          </button>
                      </div>`;
        item.average = `${item.average}%`;
        item.performance_score = `${item.performance_score}%`;
        item.flight_risk = `${item.flight_risk}%`;
        item.createdAt = moment(item.createdAt)
          .utc()
          .add(7, "hours")
          .format("YYYY-MM-DD HH:mm:ss");
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

  importPerformance: async (req, res, next) => {
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
          average: parseInt(arr.Average.replace("%", "")),
          achivement: arr["Sales Achicevements 95"],
          email: arr.Username,
          position: arr["Position Job Title"],
          directorate_name: arr["Directorate Name"],
          location_group:
            arr["Location Group (Personal Area) (Location Group Name)"],
          gender: arr.Gender,
          marital_status: arr["Marital Status (Picklist Label)"],
          age: parseFloat(arr.Age),
          cr: parseFloat(arr.CR),
          yog: parseFloat(arr.YoG),
          promosi: parseInt(arr.Promosi),
          mutasi: parseInt(arr.Mutasi),
          yos: parseFloat(arr.YoS),
          sales_performance: arr["Sales Perfomance"],
          flight_risk: parseInt(arr["Flight Risk"].replace("%", "")),
          performance_score: parseInt(
            arr["Sales Performance score"].replace("%", "")
          ),
        };
      });

      for (const item of arrayJson) {
        Performance.create(item)
          .then(res)
          .catch((err) => console.log("Err :", err.message));
      }

      return res.json({
        status: "success",
        message: "Sukses Import Data Performance",
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  },

  destroy: async (req, res) => {
    try {
      let id = req.body.id;
      const performance = await Performance.findOne({ where: { id } });
      if (!performance) {
        return res.status(404).json({
          status: "error",
          message: "Data tidak ditemukan",
        });
      }

      await performance.destroy();
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
