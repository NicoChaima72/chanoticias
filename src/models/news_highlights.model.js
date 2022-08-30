const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const News = require("./news.model");

const NewsHighlight = sequelize.define(
  "News_Highlight",
  {
    number: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    // PARA LOS EMOJIS
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    timestamps: false,
  }
);

NewsHighlight.belongsTo(News);
News.hasOne(NewsHighlight);

module.exports = NewsHighlight;
