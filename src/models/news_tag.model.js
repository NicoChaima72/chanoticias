const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const News_Tag = sequelize.define("News_Tag", {}, { timestamps: false });

module.exports = News_Tag;
