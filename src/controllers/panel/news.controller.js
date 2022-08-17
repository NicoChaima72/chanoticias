const slugify = require("slugify");
const News = require("../../models/news.model");
const User = require("../../models/user.model");
const Category = require("../../models/category.model");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");
const { uploadImage, deleteImage } = require("../../services/images.service");
const { getKeyByUrlS3 } = require("../../helpers/back");
const Tag = require("../../models/tag.model");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

module.exports = {
  index: async (req, res) => {
    const news = await News.findAll({
      include: [User, Category],
      where: { status: 1 },
    });

    return res.render("panel/pages/news/index.html", { news, action: "index" });
  },

  indexVerify: async (req, res) => {
    const news = await News.findAll({
      include: [User, Category],
      where: { status: { [Op.in]: [0, 2] } },
    });

    return res.render("panel/pages/news/index.html", {
      news,
      action: "verify",
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

    const categories = await Category.findAll({ where: { isActive: true } });
    return res.render("panel/pages/news/form.html", {
      news: {},
      categories,
      action: "create",
      tags,
    });
  },

  store: async (req, res) => {
    let { title, excerpt, body, category_id, tags, popularity } = req.body;
    const file = req.files;

    const user = await User.findByPk();
    const category = await Category.findByPk(category_id, {
      where: { isActive: 1 },
    });

    if (!category)
      return res.status(400).json({
        ok: false,
        msg: "La categoria no existe",
      });

    let image;
    try {
      image = await uploadImage(file);
    } catch (err) {
      await news.destroy();

      return res.status(400).json({ ok: false, err });
    }

    let slug = slugify(title, { lower: true });

    const existSlug = await News.findOne({
      where: { slug },
    });

    if (existSlug) slug = slug + "-" + uniqid.time();

    let news;
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
          popularity: popularity || null,
          // TODO: Checar por permiso en especifico,
          status: popularity ? 1 : 0,
        },
        { include: [User, Category] }
      );
    } catch (err) {
      console.log({ err });
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

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
    return res.redirect("/panel/news");
  },

  showVerify: async (req, res) => {
    const { news_slug } = req.params;

    const news = await News.findOne({ where: { slug: news_slug } });

    if (!news)
      return res.status(400).json({ ok: false, msg: "Noticia no encontrada" });

    const categories = await Category.findAll({ where: { isActive: true } });
    return res.render("panel/pages/news/verify.html", {
      news,
      categories,
    });
  },

  verify: async (req, res) => {
    const { news_slug } = req.params;
    const { title, excerpt, body, category_id, tags, action, popularity } =
      req.body;

    const news = await News.findOne({ where: { slug: news_slug } });

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
      popularity,
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
    const news = await News.findOne({ include: Tag,where: { slug: news_slug } });

    if (!news)
      return res.status(400).json({ ok: false, msg: "Noticia no encontrada" });

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
    const categories = await Category.findAll({ where: { isActive: true } });

    return res.render("panel/pages/news/form.html", {
      news,
      categories,
      action: "edit",
      tags,
    });
  },

  update: async (req, res) => {
    const { news_slug } = req.params;
    const { title, excerpt, body, category_id, tags } = req.body;

    const news = await News.findOne({
      where: { slug: news_slug },
    });
    if (!news)
      return res.status(400).json({ ok: false, msg: "Noticia no encontrada" });

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

  destroy: async (req, res) => {
    const { news_slug } = req.params;

    const news = await News.findOne({ where: { slug: news_slug } });
    if (!news)
      return res.status(400).json({ ok: false, msg: "Noticia no encontrada" });

    await Promise.all([
      news.destroy(),
      deleteImage(getKeyByUrlS3(news.imageUrl)),
    ]);

    req.flash("success", "La noticia " + news.title + " ha sido eliminada.");
    return res.redirect("/panel/news");
  },
};
