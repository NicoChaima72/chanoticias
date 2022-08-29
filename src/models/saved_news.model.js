const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");


const Saved_News = sequelize.define("Saved_News", {}, { timestamps: false });


module.exports = Saved_News;
