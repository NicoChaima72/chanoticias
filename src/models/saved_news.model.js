const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");
const User = require('../models/user.model');
const News = require('../models/news.model');


const Saved_News = sequelize.define("Saved_News", {}, { timestamps: false });

User.hasMany(Saved_News);
Saved_News.belongsTo(User);

News.hasMany(Saved_News);
Saved_News.belongsTo(News);

module.exports = Saved_News;
