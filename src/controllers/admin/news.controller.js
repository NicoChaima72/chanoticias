const { default: slugify } = require("slugify");
const News = require("../../models/news.model");
const User = require("../../models/user.model");
const Category = require("../../models/category.model");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");

module.exports = {
  index: async (req, res) => {
    res.json({ ok: true });
  },
  create: async (req, res) => {
    res.json({ ok: true, msg: "Show form create news" });
  },
  store: async (req, res) => {
    const { title, excerpt, body, category_id } = req.body;
    const user = await User.findByPk(12);
    const category = await Category.findByPk(category_id, {
      where: { isActive: 1 },
    });

    if (!category)
      return res.status(400).json({
        ok: false,
        msg: "La categoria no existe",
      });

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
        },
        { include: [User, Category] }
      );
    } catch (error) {
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    return res.json({ ok: true, news });
  },
  show: async (req, res) => {},
  edit: async (req, res) => {
    res.json({ ok: true, msg: "Show form edit news" });
  },
  update: async (req, res) => {},
  destroy: async (req, res) => {},
};
