"use strict";

module.exports = (sequelize, DataTypes) => {
  const Division = sequelize.define("Division", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Division.associate = (models) => {
    Division.hasMany(models.User, {
      foreignKey: "division_id",
    });
  };

  return Division;
};
