const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const User = require("./user.model");
const Category = require("./category.model");
const Tag = require("./tag.model");
const News_Tag = require("./news_tag.model");

const News = sequelize.define("News", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "EL titulo es requerido" },
      notEmpty: { msg: "El titulo es requerido" },
    },
  },
  slug: { type: DataTypes.STRING, allowNull: false },
  excerpt: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "EL extracto es requerido" },
      notEmpty: { msg: "El extracto es requerido" },
    },
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: "EL cuerpo es requerido" },
      notEmpty: { msg: "El cuerpo es requerido" },
    },
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "La imagen es requerida" },
      notEmpty: { msg: "La imagen es requerida" },
    },
  },
});

User.hasMany(News, { onDelete: "CASCADE" });
News.belongsTo(User);

Category.hasMany(News, { onDelete: "CASCADE" });
News.belongsTo(Category);

News.belongsToMany(Tag, { through: News_Tag });
Tag.belongsToMany(News, { through: News_Tag });


module.exports = News;
