const { Performance } = require("../models");
const moment = require("moment");
const _ = require("lodash");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  index: async (req, res, next) => {
    let divisionId = req.user.division_id;
    const currentMonth = moment().format("MMMM");

    const monthList = [];
    for (let i = 0; i < 12; i++) {
      const month = moment().month(i);
      const monthData = {
        id: month.format("MM"),
        name: month.format("MMMM"),
      };
      monthList.push(monthData);
    }

    return res.render("pages/dashboard", {
      title: "Main Dashboard",
      divisionId,
      currentMonth,
      monthList,
    });
  },

  multipleLineChart: async (req, res, next) => {
    try {
      const performances = await Performance.findAll({
        attributes: ["position", "performance_score", "createdAt"],
      });

      const monthlyScores = {};

      performances.forEach((performance) => {
        const position = performance.position;
        const score = performance.performance_score;
        const createdAt = moment(performance.createdAt).format("YYYY-MM");

        if (!monthlyScores[position]) {
          monthlyScores[position] = {};
        }

        if (!monthlyScores[position][createdAt]) {
          monthlyScores[position][createdAt] = [];
        }

        monthlyScores[position][createdAt].push(score);
      });

      const result = [];

      for (const position in monthlyScores) {
        const data = [];

        for (let i = 0; i < 12; i++) {
          const month = moment().month(i).format("YYYY-MM");
          const scores = monthlyScores[position][month] || [];
          let averageScore =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          if (averageScore > 0) {
            averageScore = parseFloat(averageScore.toFixed(2)).toFixed(2);
          }
          data.push(averageScore || 0);
        }
        result.push({
          label: position,
          data: data,
        });
      }

      let colors = [
        "#1d7af3",
        "#59d05d",
        "#f3545d",
        "#faedbe",
        "#1D7AF3",
        "#9C2AED",
        "#F8B41E",
        "#4E6F5C",
        "#D32E5E",
      ];

      let datasets = result.map((item) => {
        let color = _.sample(colors);
        return {
          borderColor: color,
          pointBorderColor: "#FFF",
          pointBackgroundColor: color,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          backgroundColor: "transparent",
          fill: true,
          borderWidth: 2,
          ...item,
        };
      });
      return res.json({
        status: "success",
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

  lineChart: async (req, res, next) => {
    try {
      const email = req.user.email;

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

  pieChart: async (req, res, next) => {
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

      const performances = await Performance.findAll({
        attributes: ["position", "performance_score"],
        where: {
          ...filterMonth,
        },
      });

      if (!performances.length) {
        return res.json({
          status: "error",
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderWidth: 0,
            },
          ],
          labels: [],
        });
      }

      const positionScores = {};
      const labels = [];

      performances.forEach((performance) => {
        const position = performance.position;
        const score = performance.performance_score;

        if (!positionScores[position]) {
          positionScores[position] = [];
          labels.push(position);
        }
        positionScores[position].push(score);
      });

      const averageScores = labels.map((position) => {
        const scores = positionScores[position];
        let averageScore =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;

        if (averageScore > 0) {
          averageScore = parseFloat(averageScore.toFixed(2)).toFixed(2);
        }

        return averageScore;
      });

      let colors = [
        "#1d7af3",
        "#59d05d",
        "#f3545d",
        "#faedbe",
        "#1D7AF3",
        "#9C2AED",
        "#F8B41E",
        "#4E6F5C",
        "#D32E5E",
      ];
      let color = labels.map(() => {
        return _.sample(colors);
      });
      let datasets = [
        {
          data: averageScores,
          backgroundColor: color,
          borderWidth: 0,
        },
      ];

      return res.json({
        status: "success",
        datasets,
        labels,
      });
    } catch (error) {
      return res.json({
        status: "error",
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 0,
          },
        ],
        labels: [],
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

      let email = req.user.email;
      let ownPerformance = await Performance.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("performance_score")), "average"],
          "position",
        ],
        where: {
          email: email,
          ...filterMonth,
        },
        group: ["position"],
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
        group: ["position"],
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

      return res.json({
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
