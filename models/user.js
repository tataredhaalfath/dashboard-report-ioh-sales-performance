"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  User.associate = (models) => {
    User.belongsTo(models.Division, {
      foreignKey: {
        field: "division_id",
      },
    });

    User.hasMany(models.Learningpath, {
      foreignKey: "user_id",
    });
  };

  return User;
};
