const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = require("../config/database.config");

const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "La descripcion del rol es requerida" },
      notNull: { msg: "La descripcion del rol es requerida" },
    },
    unique: { args: true, msg: "Rol ya registrado" },
  },
});

module.exports = Role;
