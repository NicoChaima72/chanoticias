const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = require("../config/database.config");
const Role = require("./role.model");
const { getWithAllPermissions } = require("../helpers/back");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es requerido" },
        notNull: { msg: "El nombre es requerido" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El email es requerido" },
        notNull: { msg: "El email es requerido" },
      },
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La contraseña es requerida" },
        notNull: { msg: "La contraseña es requerida" },
        len: { args: [8], msg: "Minimo 8 caracteres" },
      },
    },
    token: { type: DataTypes.STRING },
    expire: { type: DataTypes.DATE },
    status: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 Pendiente confirm email | 1 Activo | 2 Dado de baja | 3 Cambiar contraseña
  },
  {
    defaultScope: {
      attributes: { exclude: ["password", "token", "expire", "status"] },
    },
    scopes: {
      withAllInfo: {
        attributes: {},
      },
      withToken: {
        attributes: { exclude: ["password", "status"] },
      },
      withStatus: {
        attributes: { exclude: ["password", "token", "expire"] },
      },
    },
    hooks: {
      beforeCreate(user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
      },

      beforeUpdate(user) {
        if (user.previous().password) {
          if (user.password != user.previous().password) {
            user.password = bcrypt.hashSync(
              user.password,
              bcrypt.genSaltSync(10)
            );
          }
        }
      },
    },
  }
);

User.prototype.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

User.prototype.getWithAllPermissions = function () {
  return getWithAllPermissions(this);
};

Role.hasMany(User, { onDelete: "CASCADE" });
User.belongsTo(Role);

module.exports = User;
