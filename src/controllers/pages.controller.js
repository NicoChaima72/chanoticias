const Category = require("../models/category.model");
const News = require("../models/news.model");
const Tag = require("../models/tag.model");
const User = require("../models/user.model");
const { Op } = require("sequelize");
const NewsHighlight = require("../models/news_highlights");

module.exports = {
  index: async (req, res) => {
    const highlights = await NewsHighlight.findAll({
      include: { model: News, include: [User, Category] },
    });

    const newsByCategories = await Category.findAll({
      include: [{ model: News, order: [["createdAt", "DESC"]], limit: 6 }],
      order: [["popularity", "DESC"]],
    });

    return res.render("home.html", {
      newsByCategories,
      highlights: highlights.sort((a, b) => a.number - b.number),
    });
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
          { CategoryId: news.CategoryId },
          { id: { [Op.ne]: news.id } },
        ],
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    return res.render("pages/news/show.html", {
      news,
      relatedNews,
    });
  },

  lastNews: async (req, res) => {
    let { page } = req.query;

    page = page ? page - 1 : undefined;
    
    const { count, rows } = await News.findAndCountAll({
      include: [Category],
      order: [["createdAt", "DESC"]],
      limit: 4,
      offset: 4 * page || 0,
    });

    return res.render("pages/list.html", {
      data: { name: "Ultimas noticias" },
      news: rows,
      page: Number(page) + 1 || 1,
      count,
      limit: 4,
      action: "lastNews",
    });
  },

  showCategory: async (req, res) => {
    let { page } = req.query;
    const { category_slug } = req.params;

    
    const category = await Category.findOne({
      where: { slug: category_slug },
    });
    
    page = page ? page - 1 : undefined;

    const { count, rows } = await News.findAndCountAll({
      where: { CategoryId: category.id },
      order: [["createdAt", "DESC"]],
      limit: 1,
      offset: 1 * page || 0,
    });

    return res.render("pages/list.html", {
      data: category,
      news: rows,
      page: Number(page) + 1 || 1,
      count,
      limit: 1,
      action: "category",
    });
  },

  showTag: async (req, res) => {
    let { page } = req.query;
    const { tag_slug } = req.params;

    const tag = await Tag.findOne({
      where: { slug: tag_slug },
    });

    page = page ? page - 1 : undefined;

    const { count, rows } = await News.findAndCountAll({
      include: { model: Tag, where: { id: tag.id } },
      order: [["createdAt", "DESC"]],
      limit: 1,
      offset: 1 * page || 0,
    });

    return res.render("pages/list.html", {
      data: tag,
      news: rows,
      page: Number(page) + 1 || 1,
      count,
      limit: 1,
      action: "tag",
    });
  },
};
