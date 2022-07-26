const Category = require("../../models/category.model");
const User = require("../../models/user.model");
const helpers = require("../../helpers/back");
const slugify = require("slugify");

module.exports = {
  index: async (req, res) => {
    const categories = await Category.findAll({ include: { model: User } });
    return res.json({ ok: true, categories });
  },
  create: async (req, res) => {
    return res.json({
      ok: true,
      msg: "Mostrando el formulario create category",
    });
  },
  store: async (req, res) => {
    const { name, description, color, popularity, user_id } = req.body;
    const user = await User.findByPk(user_id);

    const existCategory = await Category.findOne({ where: { name } });
    if (existCategory)
      return res.status(400).json({
        ok: false,
        msg: "El nombre de la categoria ya está registrado",
      });

    let category;
    try {
      category = await Category.create(
        {
          name,
          slug: slugify(name, { lower: true }),
          description,
          color,
          popularity,
          UserId: user.id,
        },
        { include: User }
      );
    } catch (err) {
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    return res.json({ ok: true, category });
  },
  show: async (req, res) => {
    const { category_slug } = req.params;

    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });
    if (!category) {
      return res
        .status(400)
        .json({ ok: false, msg: "Categoria no encontrada" });
    }

    return res.json({ ok: true, category });
  },
  edit: async (req, res) => {
    const { category_slug } = req.params;

    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });

    if (!category) {
      return res.status(400).json({ ok: false, msg: "La categoria no existe" });
    }

    return res.json({
      ok: true,
      msg: "Mostrando el formulario edit category",
    });
  },
  update: async (req, res) => {
    const { category_slug } = req.params;
    const { name, description, color, popularity } = req.body;

    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });

    if (!category) {
      return res.status(400).json({ ok: false, msg: "La categoria no existe" });
    }

    await category.update({ name, description, color, popularity });

    res.json({ ok: true, category });
  },

  active: async (req, res) => {
    const { category_slug } = req.params;

    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });

    if (!category) {
      return res.status(400).json({ ok: false, msg: "La categoria no existe" });
    }

    await category.update({ isActive: !category.isActive });

    return res.json({ ok: true, category });
  },
};
