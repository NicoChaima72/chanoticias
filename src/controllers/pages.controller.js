const Category = require("../models/category.model");
const News = require("../models/news.model");
const Tag = require("../models/tag.model");
const User = require("../models/user.model");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const NewsHighlight = require("../models/news_highlights.model");
const Saved_News = require("../models/saved_news.model");
const slugify = require("slugify");

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
      title: 'Ultimas noticias'
    });
  },

  showCategory: async (req, res) => {
    let { page } = req.query;
    const { category_slug } = req.params;

    const category = await Category.findOne({
      where: { slug: category_slug },
    });

    if (!category) return res.render("404/404.html");

    page = page ? page - 1 : undefined;

    const { count, rows } = await News.findAndCountAll({
      where: { [Op.and]: [{ CategoryId: category.id }, { status: 1 }] },
      order: [["createdAt", "DESC"]],
      limit: 8,
      offset: 8 * page || 0,
    });

    return res.render("pages/list.html", {
      data: category,
      news: rows,
      page: Number(page) + 1 || 1,
      count,
      limit: 8,
      action: "category",
      title: 'Categoria ' + category.name
    });
  },

  showTag: async (req, res) => {
    let { page } = req.query;
    const { tag_slug } = req.params;

    const tag = await Tag.findOne({
      where: { slug: tag_slug },
    });
    if (!tag) return res.render("404/404.html");


    page = page ? page - 1 : undefined;

    const { count, rows } = await News.findAndCountAll({
      include: {
        model: Tag,
        where: { id: tag.id },
      },
      order: [["createdAt", "DESC"]],
      limit: 8,
      offset: 8 * page || 0,
      where: { status: 1 },
    });

    return res.render("pages/list.html", {
      data: tag,
      news: rows,
      page: Number(page) + 1 || 1,
      count,
      limit: 8,
      action: "tag",
      title: 'Etiqueta ' + tag.name
    });
  },
  showNews: async (req, res) => {
    const { news_slug } = req.params;
    const news = await News.findOne({
      include: [User, Category, Tag],
      where: { [Op.and]: [{ slug: news_slug }, { status: 1 }] },
    });
    if (!news) {
      return res.render("404/news.show.404.html");
    }

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

    let isSaved = null;
    if (req.user)
      isSaved = await Saved_News.findOne({
        where: { [Op.and]: [{ NewsId: news.id }, { UserId: req.user.id }] },
      });

    return res.render("pages/news/show.html", {
      news,
      relatedNews,
      isSaved: !!isSaved,
    });
  },

  search: async (req, res) => {
    let { search, page } = req.query;

    if (!search) return res.render("pages/search.html", { search });

    page = page ? page - 1 : undefined;
    search = search.trim();

    console.log({ search });

    let news = News.findAndCountAll({
      include: [Category, Tag],
      order: [["createdAt", "DESC"]],
      limit: 8,
      offset: 8 * page || 0,
      where: {
        [Op.and]: [{ status: 1 }, { title: { [Op.substring]: search } }],
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
      where: { name: { [Op.substring]: slugify(search, { lower: true }) } },
    });

    [news, tags] = await Promise.all([news, tags]);

    // return res.json({ news });

    return res.render("pages/search.html", {
      search,
      news: news.rows,
      count: news.count,
      tags: JSON.parse(JSON.stringify(tags)).filter((t) => t.News_Count > 0),
      page: Number(page) + 1 || 1,
      limit: 8,
    });
  },

  savedNews: async (req, res) => {
    let { page } = req.query;
    page = page ? page - 1 : undefined;

    const { count, rows } = await Saved_News.findAndCountAll({
      include: [{ model: News, where: { status: 1 } }],
      where: { UserId: req.user.id },
      limit: 8,
      offset: 8 * page || 0,
    });

    // return res.json({ ok: true, msg: "Saved news", count, rows });
    // return res.json({data: {name: 'Noticias guardados'},
    //   news: rows.map(r => r.News),
    //   page: Number(page) + 1 || 1,
    //   count,
    //   limit: 8,
    //   action: "category",})
    return res.render("pages/list.html", {
      data: { name: "Noticias guardadas" },
      news: rows.map((r) => r.News),
      page: Number(page) + 1 || 1,
      count,
      limit: 8,
      action: "saved-news",
      title: 'Noticias guardadas'
    });
  },
};
