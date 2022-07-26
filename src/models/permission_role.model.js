const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config.js");

const Permission_Role = sequelize.define(
  "Permission_Role",
  {},
  { timestamps: false }
);

module.exports = Permission_Role;
