const helpers = require("../../helpers/back");
const Tag = require("../../models/tag.model");
const slugify = require("slugify");
const User = require("../../models/user.model");

module.exports = {
  index: async (req, res) => {
    const tags = await Tag.findAll();

    return res.json({ ok: true, tags });
  },

  create: async (req, res) => {
    return res.json({ ok: true, msg: "Mostrando el formulario create tag" });
  },

  store: async (req, res) => {
    const { name } = req.body;
    const existTag = await Tag.findOne({ where: { name } });
    if (existTag)
      return res.status(400).json({
        ok: false,
        msg: "El nombre del tag ya está registrado",
      });

    const user = await User.findByPk(1);
    let tag;
    try {
      tag = await Tag.create({
        name,
        slug: slugify(name, { lower: true }),
        UserId: user.id,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    return res.json({ ok: true, tag });
  },

  show: async (req, res) => {
    const { tag_slug } = req.params;
    const tag = await Tag.findOne({ where: { slug: tag_slug } });

    if (!tag)
      return res.status(400).json({ ok: false, msg: "Tag no encontrado" });

    return res.json({ ok: true, tag });
  },

  edit: async (req, res) => {
    const { tag_slug } = req.params;
    const tag = await Tag.findOne({ where: { slug: tag_slug } });

    if (!tag)
      return res.status(400).json({ ok: false, msg: "Tag no encontrado" });

    return res.json({ ok: true, msg: "Mostrando el formulario edit tag" });
  },

  update: async (req, res) => {
    const { tag_slug } = req.params;
    const { name } = req.body;

    const tag = await Tag.findOne({ where: { slug: tag_slug } });

    if (!tag)
      return res.status(400).json({ ok: false, msg: "Tag no encontrado" });

    await tag.update({ name });

    return res.json({ ok: true, tag });
  },

  destroy: async (req, res) => {
    const { tag_slug } = req.params;
    const tag = await Tag.findOne({ where: { slug: tag_slug } });

    if (!tag)
      return res.status(400).json({ ok: false, msg: "Tag no encontrado" });

    await tag.destroy();

    res.json({ ok: true.valueOf, tag });
  },
};
