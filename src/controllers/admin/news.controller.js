const { default: slugify } = require("slugify");
const News = require("../../models/news.model");
const User = require("../../models/user.model");
const Category = require("../../models/category.model");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");
const { uploadImage, deleteImage } = require("../../services/images.service");
const { getKeyByUrlS3 } = require("../../helpers/back");
const Tag = require("../../models/tag.model");

module.exports = {
  index: async (req, res) => {
    res.json({ ok: true });
  },

  create: async (req, res) => {
    res.json({ ok: true, msg: "Show form create news" });
  },

  store: async (req, res) => {
    const { title, excerpt, body, category_id, tags } = req.body;
    const file = req.files;

    const user = await User.findByPk(12);
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
      // TODO: Agregar imagen
      news = await News.create(
        {
          title,
          slug,
          excerpt,
          body,
          CategoryId: category.id,
          UserId: user.id,
          imageUrl: image.Data[0].Location,
        },
        { include: [User, Category] }
      );
    } catch (error) {
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    try {
      await news.addTags(tags || []);
    } catch (err) {
      await Promise.all([
        news.destroy(),
        deleteImage(getKeyByUrlS3(news.imageUrl)),
      ]);
      return res.status(400).json({ ok: false, err });
    }

    news = await News.findByPk(news.id, { include: [User, Category, Tag] });

    return res.json({ ok: true, news });
  },

  show: async (req, res) => {
    const { news_slug } = req.params;

    const news = News.findOne({ where: { slug: news_slug } });
    if (!news)
      return res.status(400).json({ ok: false, msg: "Noticia no encontrada" });

    return res.json({ ok: true, news });
  },

  edit: async (req, res) => {
    res.json({ ok: true, msg: "Show form edit news" });
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

    await news.setTags(tags || []);

    result = await News.findByPk(news.id, { include: [User, Category, Tag] });

    return res.json({ ok: true, news: result });
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

    return res.json({ ok: true });
  },

  addTags: async (req, res) => {
    const { tags } = req.body;

    res.json({ ok: true });
  },

  deleteTags: async (req, res) => {
    res.json({ ok: true });
  },
};
