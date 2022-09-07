const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = require("../config/database.config");

const Role = sequelize.define(
  "Role",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "La descripcion del rol es requerida" },
        notNull: { msg: "La descripcion del rol es requerida" },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "La descripcion del rol es requerida" },
        notNull: { msg: "La descripcion del rol es requerida" },
      },
    },
    canUpdate: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
  },
  { timestamps: false }
);

module.exports = Role;
