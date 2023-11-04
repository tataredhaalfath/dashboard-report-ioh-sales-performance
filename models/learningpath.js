"use strict";

module.exports = (sequelize, DataTypes) => {
  const Learningpath = sequelize.define("Learningpath", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Learningpath.associate = (models) => {
    Learningpath.belongsTo(models.User, {
      foreignKey: {
        field: "user_id",
      },
    });
  };

  return Learningpath;
};
