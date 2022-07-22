const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");
const News = require("./news.model");
const NewsTag = require("./news_tag.model");
const User = require("./user.model");

const Tag = sequelize.define("Tag", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "La descripcion es requerida" },
      notEmpty: { msg: "La descripcion es requerida" },
    },
    unique: { args: true, msg: "Tag ya registrado" },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "El slug es requerido" },
      notEmpty: { msg: "El slug es requerido" },
    },
  },
});

User.hasMany(Tag, { onDelete: "CASCADE" });
Tag.belongsTo(User);

module.exports = Tag;
