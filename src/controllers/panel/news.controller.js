const slugify = require("slugify");
const News = require("../../models/news.model");
const User = require("../../models/user.model");
const Category = require("../../models/category.model");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");
const { uploadImage, deleteImage } = require("../../services/images.service");
const { getKeyByUrlS3, can } = require("../../helpers/back");
const Tag = require("../../models/tag.model");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const NewsHighlight = require("../../models/news_highlights.model");

module.exports = {
  index: async (req, res) => {
    const highlights = await NewsHighlight.findAll({
      include: { model: News, include: [User, Category] },
    });
    const news = await News.findAll({
      include: [User, Category],
      where: { status: 1 },
    });

    return res.render("panel/pages/news/index.ejs", {
      news,
      action: "index",
      highlights,
    });
  },

  indexMe: async (req, res) => {
    const news = await News.findAll({
      include: [User, Category],
      where: { UserId: req.user.id },
    });

    return res.render("panel/pages/news/index.ejs", {
      news,
      action: "indexMe",
    });
  },

  indexVerify: async (req, res) => {
    const news = await News.findAll({
      include: [User, Category],
      where: { status: { [Op.in]: [0, 2] } },
    });

    return res.render("panel/pages/news/index.ejs", {
      news,
      action: "verify",
    });
  },

  showByUser: async (req, res) => {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id);

    if (!user) {
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
    }

    const news = await News.findAll({
      include: [User, Category],
      where: { UserId: user_id },
    });

    return res.render("panel/pages/news/index.ejs", {
      news,
      action: "showUser",
      highlights: [],
      data: user,
    });
  },

  showByCategory: async (req, res) => {
    const { category_slug } = req.params;

    const category = await Category.findOne({ where: { slug: category_slug } });
    if (!category) {
      req.flash("warning", "La categoria no existe.");
      return res.redirect("/panel/categories");
    }
    const news = await News.findAll({
      include: [User, Category],
      where: { CategoryId: category.id },
    });
    return res.render("panel/pages/news/index.ejs", {
      news,
      action: "showUser",
      highlights: [],
      data: category,
    });
  },

  showByTag: async (req, res) => {
    const { tag_slug } = req.params;

    const tag = await Tag.findOne({ where: { slug: tag_slug } });
    if (!tag) {
      req.flash("warning", "La etiqueta no existe.");
      return res.redirect("/panel/tags");
    }
    const news = await News.findAll({
      include: [User, Category, { model: Tag, where: { id: tag.id } }],
    });

    return res.render("panel/pages/news/index.ejs", {
      news,
      action: "showTag",
      highlights: [],
      data: tag,
    });
  },

  create: async (req, res) => {
    const tags = await Tag.findAll({
      group: ["Tag.id"],
      includeIgnoreAttributes: false,
      include: [News],
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("News.id")), "News_Count"],
        ],
      },
      order: [[Sequelize.literal("News_Count"), "DESC"]],
    });

    const categories = await Category.findAll({
      where: { isActive: true },
      order: [["popularity", "desc"]],
    });
    return res.render("panel/pages/news/form.ejs", {
      news: {},
      categories,
      action: "create",
      tags,
    });
  },

  store: async (req, res) => {
    let { title, excerpt, body, category_id, tags } = req.body;
    const file = req.files;

    const user = await User.findByPk();
    const category = await Category.findByPk(category_id, {
      where: { isActive: 1 },
    });

    if (!category) {
      req.flash("data", req.body);
      req.flash("error", "La categoría no existe");
      return res.redirect(req.header("Referer") || "/");
    }

    let image;
    try {
      image = await uploadImage(file);
    } catch (err) {
      await news.destroy();
      req.flash("data", req.body);
      req.flash("error", "Ha ocurrido un error, intenta más tarde");
      return res.redirect(req.header("Referer") || "/");
    }

    let slug = slugify(title, { lower: true }).substring(0, 45);

    const existSlug = await News.findOne({
      where: { slug },
    });

    if (existSlug) slug = slug + "-" + uniqid.time();

    let news;
    let error = false;
    try {
      news = await News.create(
        {
          title,
          slug,
          excerpt,
          body,
          CategoryId: category.id,
          UserId: res.locals._user.id,
          imageUrl: image.Data[0].Location,
          status: helpers.can(req.user, "verificar noticias") ? 1 : 0,
        },
        { include: [User, Category] }
      );
    } catch (err) {
      console.log({ err });
      error = true;
      req.flash("error", "Ha ocurrido un error, intenta más tarde");
    }
    if (error) return res.redirect("/panel/news");

    if (typeof tags === "string") tags = [tags];

    const tagsToAdd = [];

    for (const tag of [...(tags || [])]) {
      if (tag[0] === " ") {
        tagsToAdd.push(Number(tag.substring(1)));
      } else {
        let slug = slugify(tag, { lower: true });
        const existSlug = await Tag.findOne({ where: { slug } });
        if (existSlug) slug += `-${uniqid.time()}`;
        const tagRegistered = await Tag.create({
          name: tag,
          slug,
          UserId: req.user.id,
        });
        tagsToAdd.push(tagRegistered.id);
      }
    }

    news.setTags(tagsToAdd);

    req.flash("success", "La noticia se ha agregado exitosamente");
    if (can(req.user, "Listar todas las noticias"))
      return res.redirect("/panel/news");
      
    return res.redirect("/panel/news/me");
  },

  showVerify: async (req, res) => {
    const { news_slug } = req.params;

    const news = await News.findOne({ where: { slug: news_slug } });

    if (!news) {
      req.flash("warning", "La noticia no existe.");
      return res.redirect("/panel/news/verify");
    }

    const categories = await Category.findAll({ where: { isActive: true } });
    return res.render("panel/pages/news/verify.ejs", {
      news,
      categories,
    });
  },

  verify: async (req, res) => {
    const { news_slug } = req.params;
    const { title, excerpt, body, category_id, tags, action } = req.body;

    const news = await News.findOne({ where: { slug: news_slug } });
    if (!news) {
      req.flash("warning", "La noticia no existe.");
      return res.redirect("/panel/news/verify");
    }

    let result = [];
    if (req.files.length)
      result = await Promise.all([
        uploadImage(req.files),
        deleteImage(getKeyByUrlS3(news.imageUrl)),
      ]);

    await news.update({
      title,
      excerpt,
      body,
      CategoryId: category_id,
      imageUrl: !!result.length ? result[0].Data[0].Location : news.imageUrl,
      status: action === "aceptar" ? 1 : 2,
    });

    await news.setTags(tags || []);

    req.flash(
      action === "aceptar" ? "success" : "warning",
      "Se ha " +
        (action === "aceptar" ? " aceptado" : "rechazado") +
        " la noticia."
    );
    return res.redirect("/panel/news/verify");
  },

  edit: async (req, res) => {
    const { news_slug } = req.params;
    const news = await News.findOne({
      include: Tag,
      where: { slug: news_slug },
    });

    if (!news) {
      req.flash("warning", "La noticia no existe.");
      return res.redirect("/panel/news");
    }

    if (
      !helpers.can(req.user, "editar todas las noticias") &&
      req.user.id != news.UserId
    ) {
      req.flash("warning", "No tienes permisos para acceder a este apartado");
      return res.redirect("/panel/news");
    }

    const tags = await Tag.findAll({
      group: ["Tag.id"],
      includeIgnoreAttributes: false,
      include: [News],
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("News.id")), "News_Count"],
        ],
      },
      order: [[Sequelize.literal("News_Count"), "DESC"]],
    });
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [["popularity", "desc"]],
    });

    return res.render("panel/pages/news/form.ejs", {
      news,
      categories,
      action: "edit",
      tags,
    });
  },

  update: async (req, res) => {
    const { news_slug } = req.params;
    let { title, excerpt, body, category_id, tags } = req.body;

    const news = await News.findOne({
      where: { slug: news_slug },
    });
    if (!news) {
      req.flash("warning", "La noticia no existe.");
      return res.redirect("/panel/news/");
    }
    let result = [];
    if (req.files.length)
      result = await Promise.all([
        uploadImage(req.files),
        deleteImage(getKeyByUrlS3(news.imageUrl)),
      ]);

    await news.update({
      title,
      excerpt,
      body,
      CategoryId: category_id,
      imageUrl: !!result.length ? result[0].Data[0].Location : news.imageUrl,
    });

    if (typeof tags === "string") tags = [tags];

    const tagsToAdd = [];

    for (const tag of [...(tags || [])]) {
      if (tag[0] === " ") {
        tagsToAdd.push(Number(tag.substring(1)));
      } else {
        let slug = slugify(tag, { lower: true });
        const existSlug = await Tag.findOne({ where: { slug } });
        if (existSlug) slug += `-${uniqid.time()}`;
        const tagRegistered = await Tag.create({
          name: tag,
          slug,
          UserId: req.user.id,
        });
        tagsToAdd.push(tagRegistered.id);
      }
    }
    news.setTags(tagsToAdd);

    req.flash("success", "La noticia se ha actualizado exitosamente");
    return res.redirect("/panel/news");
  },

  highlight: async (req, res) => {
    const { news_slug } = req.params;
    const { number } = req.body;

    const news = await News.findOne({ where: { slug: news_slug } });

    if (!news) {
      req.flash("warning", "La noticia no existe.");
      return res.redirect("/panel/news");
    }

    const highlight = await NewsHighlight.findOne({ where: { number } });

    if (!highlight) {
      req.flash("error", "No se puede asignar a este numero");
      return res.redirect(req.header("Referer") || "/");
    }

    await highlight.update({ NewsId: news.id });

    req.flash(
      "success",
      "Se ha asignado la noticia a destacados " + highlight.number
    );
    return res.redirect("/panel/news");
  },

  destroy: async (req, res) => {
    const { news_slug } = req.params;

    const news = await News.findOne({ where: { slug: news_slug } });

    if (!news) {
      req.flash("warning", "La noticia no existe.");
      return res.redirect("/panel/news");
    }
    await Promise.all([
      news.destroy(),
      deleteImage(getKeyByUrlS3(news.imageUrl)),
    ]);

    req.flash("success", "La noticia " + news.title + " ha sido eliminada.");
    return res.redirect("/panel/news");
  },
};
