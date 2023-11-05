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
    status: {
      type: DataTypes.BOOLEAN, // status that link is visited
      defaultValue: false,
    },
    image: {
      type: DataTypes.STRING,
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
