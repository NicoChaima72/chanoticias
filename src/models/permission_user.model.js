const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config.js");

const Permission_User = sequelize.define(
  "Permission_User",
  {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

module.exports = Permission_User;
