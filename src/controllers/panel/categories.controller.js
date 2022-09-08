const Category = require("../../models/category.model");
const User = require("../../models/user.model");
const News = require("../../models/news.model");
const helpers = require("../../helpers/back");
const slugify = require("slugify");
const Sequelize = require("sequelize");
const uniqid = require("uniqid");

module.exports = {
  index: async (req, res) => {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [Sequelize.fn("COUNT", Sequelize.col("News.id")), "NewsCount"],
        ],
      },
      include: [{ model: User }, { model: News, attributes: [] }],
      group: ["Category.id"],
    });

    // return res.json({ok: true, categories});
    return res.render("panel/pages/categories/index.ejs", {
      categories: JSON.parse(JSON.stringify(categories)),
    });
  },
  create: async (req, res) => {
    return res.render("panel/pages/categories/form.ejs", {
      category: {},
      action: "create",
    });
  },
  store: async (req, res) => {
    const { name, description, color, popularity } = req.body;
    const user = await User.findByPk(req.user.id);

    let existCategory = await Category.findOne({ where: { name } });
    if (existCategory) {
      req.flash("data", req.body);
      req.flash("errors", {
        name: { message: "El nombre de la categoria ya está registrado." },
      });
      return res.redirect(req.header("Referer") || "/");
    }

    let slug = slugify(name, { lower: true });

    existCategory = await Category.findOne({ where: { slug } });

    slug = existCategory ? `${slug}-${uniqid.time()}` : slug;

    let category;
    try {
      category = await Category.create(
        {
          name,
          slug,
          description,
          color,
          popularity,
          UserId: user.id,
        },
        { include: User }
      );
    } catch (err) {
      req.flash("error", "Ha ocurrido un error, intenta más tarde.");
      return res.redirect("/panel/categories");
    }
    req.flash("success", "Se ha agregado la categoria exitosamente.");
    return res.redirect("/panel/categories");
  },
  // show: async (req, res) => {
  //   const { category_slug } = req.params;

  //   const category = await Category.findOne({
  //     where: { slug: category_slug },
  //     include: User,
  //   });
  //   if (!category) {
  //     req.flash("warning", "La categoria no existe.");
  //     return res.redirect("/panel/categories");
  //   }

  //   return res.json({ ok: true, category });
  // },
  edit: async (req, res) => {
    const { category_slug } = req.params;

    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });

    if (!category) {
      req.flash("warning", "La categoria no existe.");
      return res.redirect("/panel/categories");
    }

    return res.render("panel/pages/categories/form.ejs", {
      category,
      action: "edit",
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
      req.flash("warning", "La categoria no existe.");
      return res.redirect("/panel/categories");
    }

    await category.update({ name, description, color, popularity });

    req.flash("success", "La categoria se ha actualizado exitosamente.");
    return res.redirect("/panel/categories");
  },

  destroy: async (req, res) => {
    const { category_slug } = req.params;
    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });

    if (!category) {
      req.flash("warning", "La categoria no existe.");
      return res.redirect("/panel/categories");
    }

    await category.destroy();

    req.flash("success", "La categoria " + category.name + " se ha eliminado.");
    return res.redirect("/panel/categories");
  },

  active: async (req, res) => {
    const { category_slug } = req.params;

    const category = await Category.findOne({
      where: { slug: category_slug },
      include: User,
    });

    if (!category) {
      req.flash("warning", "La categoria no existe.");
      return res.redirect("/panel/categories");
    }

    await category.update({ isActive: !category.isActive });

    req.flash(
      "success",
      "Se ha cambiado el estado a la categoria " + category.name + "."
    );
    return res.redirect("/panel/categories");
  },
};
