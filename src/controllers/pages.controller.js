const Category = require("../models/category.model");
const News = require("../models/news.model");
const Tag = require("../models/tag.model");
const User = require("../models/user.model");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const NewsHighlight = require("../models/news_highlights");

module.exports = {
  index: async (req, res) => {
    let highlights = await NewsHighlight.findAll({
      include: { model: News, include: [User, Category] },
    });

    const newsByCategories = await Category.findAll({
      include: [{ model: News, order: [["createdAt", "DESC"]], limit: 6 }],
      order: [["popularity", "DESC"]],
    });

    // console.log({ newsByCategories: newsByCategories[0].News[index] });

    highlights = highlights.map((highlight, index) => {
      if (!highlight.NewsId) {
        return { News: newsByCategories[0].News[index] };
      }
      return highlight;
    });

    return res.render("home.html", {
      newsByCategories,
      highlights: highlights.sort((a, b) => a.number - b.number),
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
      where: { status: 1 },
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
      where: { [Op.and]: [{ CategoryId: category.id }, { status: 1 }] },
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
      include: {
        model: Tag,
        where: { id: tag.id },
      },
      order: [["createdAt", "DESC"]],
      limit: 1,
      offset: 1 * page || 0,
      where: { status: 1 },
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
  showNews: async (req, res) => {
    const { news_slug } = req.params;
    const news = await News.findOne({
      include: [User, Category, Tag],
      where: { [Op.and]: [{ slug: news_slug }, { status: 1 }] },
    });

    const relatedNews = await News.findAll({
      where: {
        [Op.and]: [
          { CategoryId: news.CategoryId },
          { id: { [Op.ne]: news.id } },
          { status: 1 },
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

  search: async (req, res) => {
    let { search, page } = req.query;

    if (!search) return res.render("pages/search.html", { search });

    page = page ? page - 1 : undefined;
    search = search.trim();

    console.log({search});

    let news = News.findAndCountAll({
      include: [Category, Tag],
      order: [["createdAt", "DESC"]],
      limit: 1,
      offset: 1 * page || 0,
      where: {
        [Op.and]: [{ status: 1 }, {title: {[Op.substring]: search}}],
      },
    });

    let tags = await Tag.findAll({
      group: ["Tag.id"],
      includeIgnoreAttributes: false,
      include: [News],
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("News.id")), "News_Count"],
        ],
      },
      order: [[Sequelize.literal("News_Count"), "DESC"]],
      where: { name: { [Op.substring]: search } },
    });

    [news, tags] = await Promise.all([news, tags]);


    // return res.json({ news });

    
    return res.render("pages/search.html", {
      search,
      news: news.rows,
      count: news.count,
      tags: JSON.parse(JSON.stringify(tags)).filter(t => t.News_Count > 0),
      page: Number(page) + 1 || 1,
      limit: 1,
    });
  },
};
