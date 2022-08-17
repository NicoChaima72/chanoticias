const Category = require("../models/category.model");
const News = require("../models/news.model");
const Tag = require("../models/tag.model");
const User = require("../models/user.model");
const { Op } = require("sequelize");

module.exports = {
  index: async (req, res) => {
    const newsByCategories = await Category.findAll({
      include: [{ model: News, order: [["createdAt", "DESC"]], limit: 6 }],
      order: [["popularity", "DESC"]],
    });

    return res.render("home.html", { newsByCategories });
  },
  showNews: async (req, res) => {
    const { news_slug } = req.params;
    const news = await News.findOne({
      include: [User, Category, Tag],
      where: { slug: news_slug },
    });

    const relatedNews = await News.findAll({
      where: {
        [Op.and]: [
          { CategoryId: news.CategoryId  },
          { id: { [Op.ne]: news.id  } },
        ],
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // return res.json({ok:true, news, relatedNews})
    return res.render("pages/news/show.html", {
      news,
      relatedNews
    });
  },
  showCategory: async (req, res) => {
    return res.render("pages/categories/show.html");
  },
  showTag: async (req, res) => {
    return res.render("pages/tags/show.html");
  },
};
