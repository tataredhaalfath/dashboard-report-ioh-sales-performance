const { Division, User, Performance } = require("../models");
const moment = require("moment");
const _ = require("lodash");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  index: async (req, res, next) => {
    let divisionId = req.user.division_id;
    const currentMonth = moment().format("MMMM");
    let divisions = await Division.findAll({ attributes: ["id", "name"] });

    const monthList = [];
    for (let i = 0; i < 12; i++) {
      const month = moment().month(i);
      const monthData = {
        id: month.format("MM"),
        name: month.format("MMMM"),
      };
      monthList.push(monthData);
    }

    res.render("pages/salesperformance", {
      title: "Performa Sales",
      divisionId,
      currentMonth,
      monthList,
      divisions,
    });
  },

  getUsers: async (req, res, next) => {
    try {
      let division = req.query.division;
      let users = await User.findAll({
        attributes: ["id", "email"],
        where: {
          division_id: division,
        },
      });

      return res.json({
        status: "success",
        data: users,
      });
    } catch (error) {
      return res.json({
        status: "error",
        data: [],
        message: error.message,
      });
    }
  },

  lineChart: async (req, res, next) => {
    try {
      const email = req.query.email;
      if (!email) {
        return res.json({
          status: "error",
          datasets: [],
          message: "email undefined",
        });
      }

      const performances = await Performance.findAll({
        attributes: ["performance_score", "createdAt"],
        where: {
          email: email,
        },
        order: [["createdAt", "ASC"]],
      });

      if (!performances.length) {
        return res.json({
          status: "error",
          datasets: [],
          message: "Data Performance not found",
        });
      }
      const monthlyScores = {};

      performances.forEach((performance) => {
        const score = performance.performance_score;
        const createdAt = moment(performance.createdAt).format("YYYY-MM");

        if (!monthlyScores[createdAt]) {
          monthlyScores[createdAt] = [];
        }

        monthlyScores[createdAt].push(score);
      });

      const data = [];

      for (let i = 0; i < 12; i++) {
        const month = moment().month(i).format("YYYY-MM");
        const scores = monthlyScores[month] || [];
        let averageScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (averageScore > 0) {
          averageScore = parseFloat(averageScore.toFixed(2)).toFixed(2);
        }
        data.push(averageScore || 0);
      }

      let datasets = [
        {
          label: "User Performance",
          borderColor: "#1d7af3",
          pointBorderColor: "#FFF",
          pointBackgroundColor: "#1d7af3",
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          backgroundColor: "transparent",
          fill: true,
          borderWidth: 2,
          data: data,
        },
      ];

      return res.json({
        status: "succes",
        datasets,
      });
    } catch (error) {
      return res.json({
        status: "error",
        datasets: [],
        message: error.message,
      });
    }
  },

  barChart: async (req, res, next) => {
    try {
      const currentDate = moment().startOf("month");

      let month = req.query.month;

      let filterMonth = {
        createdAt: {
          [Op.gte]: moment(currentDate)
            .utc()
            .add(7, "hours")
            .startOf("month")
            .toDate(),
          [Op.lt]: moment(currentDate)
            .utc()
            .add(7, "hours")
            .endOf("month")
            .toDate(),
        },
      };

      if (month && month != "all") {
        month = parseInt(month);
        const currentYear = moment().year();

        const startDate = moment()
          .year(currentYear)
          .month(month - 1)
          .utc()
          .add(7, "hours")
          .startOf("month")
          .toDate();
        const endDate = moment()
          .year(currentYear)
          .month(month - 1)
          .utc()
          .add(7, "hours")
          .endOf("month")
          .toDate();

        filterMonth = {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        };
      }

      let email = req.query.email;
      let ownPerformance = await Performance.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("performance_score")), "average"],
          "position",
        ],
        where: {
          email: email,
          ...filterMonth,
        },
      });

      ownPerformance = JSON.parse(JSON.stringify(ownPerformance));

      if (!ownPerformance.average) {
        return res.json({
          status: "error",
          datasets: [
            {
              label: "Performance",
              backgroundColor: "rgb(23, 125, 255)",
              borderColor: "rgb(23, 125, 255)",
              data: [],
            },
          ],
          message: error.message,
        });
      }

      ownPerformance.average = parseFloat(ownPerformance.average).toFixed(2);

      let divisionPerformance = await Performance.findAll({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("performance_score")), "average"],
        ],
        where: {
          position: ownPerformance.position,
          ...filterMonth,
        },
      });

      divisionPerformance = JSON.parse(JSON.stringify(divisionPerformance));
      if (!divisionPerformance.length) {
        return res.json({
          status: "error",
          datasets: [
            {
              label: "Performance",
              backgroundColor: "rgb(23, 125, 255)",
              borderColor: "rgb(23, 125, 255)",
              data: [],
            },
          ],
          message: error.message,
        });
      }

      divisionPerformance.average = parseFloat(
        divisionPerformance[0].average
      ).toFixed(2);

      res.json({
        status: "success",
        datasets: [
          {
            label: "Performance",
            backgroundColor: "rgb(23, 125, 255)",
            borderColor: "rgb(23, 125, 255)",
            data: [ownPerformance.average, divisionPerformance.average],
          },
        ],
      });
    } catch (error) {
      return res.json({
        status: "error",
        datasets: [
          {
            label: "Performance",
            backgroundColor: "rgb(23, 125, 255)",
            borderColor: "rgb(23, 125, 255)",
            data: [],
          },
        ],
        message: error.message,
      });
    }
  },
};
