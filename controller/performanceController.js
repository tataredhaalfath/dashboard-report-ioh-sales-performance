const moment = require("moment");
const { Performance } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  index: (req, res, next) => {
    res.render("pages/performance", { title: "Data Performa" });
  },

  dataTable: async (req, res, next) => {
    let { start_date, end_date, division, email } = req.query;
    let filterDate = {};

    if (!start_date) {
      filterDate.start_date = moment().startOf("days").toDate();
    }

    if (!end_date) {
      filterDate.end_date = moment().endOf("days").toDate();
    }

    if (start_date && end_date && start_date <= end_date) {
      filterDate.start_date = moment(start_date, "YYYY-MM-DD")
        .startOf("days")
        .toDate();
      filterDate.end_date = moment(end_date, "YYYY-MM-DD")
        .endOf("days")
        .toDate();
    }

    let where = {
      createdAt: {
        [Op.gte]: moment.utc(filterDate.start_date).toDate(),
        [Op.lte]: moment.utc(filterDate.end_date).toDate(),
      },
    };

    if (req.user.division_id != 1) {
      where.email = req.user.email;
    }

    if (division) {
      where.position = division;
    }

    if (email) {
      where.email = email;
    }

    if (req.query.search["value"]) {
      where.email = req.query.search["value"];
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
        "sales_performance",
        "performance_score",
        "flight_risk",
        "achivement",
        "directorate_name",
        "location_group",
      ],
      where,
      order: [["createdAt", "desc"]],
    }).then((result) => {
      result = JSON.parse(JSON.stringify(result));
      let output = result.map((item) => {
        let action = `<div class='dropdown-primary dropdown open'>
                          <button class='btn btn-sm btn-primary dropdown-toggle waves-effect waves-light' id='dropdown-${item.id}' data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                              Aksi
                          </button>
                          <div class='dropdown-menu' aria-labelledby="dropdown-${item.id}" data-dropdown-out='fadeOut'>
                              <a class='dropdown-item' onclick='return removeData("${item.id}");' href='javascript:void(0)' title='Remove'>Hapus</a>
                          </div>
                      </div>`;

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
};
