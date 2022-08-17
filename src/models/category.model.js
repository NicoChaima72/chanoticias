const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const User = require("./user.model");

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "El nombre es obligatorio" },
        notEmpty: { msg: "El nombre es obligatorio" },
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: { type: DataTypes.TEXT },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "El color es obligatorio" },
        notEmpty: { msg: "El color es obligatorio" },
      },
    },
    popularity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        notNull: { msg: "La popularidad es requerida" },
        notEmpty: { msg: "La popularidad es requerida" },
      },
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: 1 },
  },
  {
    // PARA LOS EMOJIS
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  }
);

User.hasMany(Category, { onDelete: "CASCADE" });
Category.belongsTo(User);

module.exports = Category;
