"use strict";

module.exports = (sequelize, DataTypes) => {
  const Performance = sequelize.define("Performance", {
    average: DataTypes.INTEGER,
    achivement: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: DataTypes.STRING,
    directorate_name: DataTypes.STRING,
    location_group: DataTypes.STRING,
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        customValidator: (value) => {
          const enums = ["Male", "Female"];
          if (!enums.includes(value)) {
            throw new Error("not a valid option");
          }
        },
      },
    },
    marital_status: DataTypes.STRING,
    age: DataTypes.FLOAT,
    cr: DataTypes.FLOAT,
    yog: DataTypes.FLOAT,
    promosi: DataTypes.INTEGER,
    mutasi: DataTypes.INTEGER,
    yos: DataTypes.FLOAT,
    boxy: DataTypes.INTEGER,
    boxy1: DataTypes.INTEGER,
    boxy2: DataTypes.INTEGER,
    impy: DataTypes.INTEGER,
    impy1: DataTypes.INTEGER,
    impy2: DataTypes.INTEGER,
    sales_performance: DataTypes.STRING,
    flight_risk: DataTypes.INTEGER,
    performance_score: DataTypes.INTEGER,
  });

  return Performance;
};
