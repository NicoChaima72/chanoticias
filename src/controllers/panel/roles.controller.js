const Permission = require("../../models/permission.model");
const Role = require("../../models/role.model");
const helpers = require("../../helpers/back");
const slugify = require("slugify");

module.exports = {
  index: async (req, res) => {
    const roles = await Role.findAll({ include: Permission });

    return res.json({ ok: true, roles });
  },

  create: async (req, res) => {
    return res.json({ ok: true, msg: "Mostrando el formulario create role" });
  },

  store: async (req, res, next) => {
    const { description, permissions } = req.body;

    const existRole = await Role.findOne({ where: { description } });

    if (existRole)
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un rol con esta descripcion" });

    let role;
    try {
      role = await Role.create({
        slug: slugify(description, { lower: true }),
        description,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    try {
      await role.addPermissions(permissions);
    } catch (err) {
      await role.destroy();
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    const result = await Role.findByPk(role.id, { include: Permission });

    return res.json({ ok: true, role: result });
  },

  show: async (req, res) => {
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      return res.status(400).json({ ok: false, msg: "Rol no encontrado" });
    }

    return res.json({ ok: true, role });
  },

  edit: async (req, res) => {
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      return res.status(400).json({ ok: false, msg: "Rol no encontrado" });
    }

    return res.json({
      ok: true,
      msg: "Mostrando el formulario edit role",
    });
  },

  update: async (req, res) => {
    const { description, permissions } = req.body;
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      return res.status(400).json({ ok: false, msg: "Rol no encontrado" });
    }

    try {
      await role.update({ description });
    } catch (err) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ha ocurrido un error al actualizar" });
    }

    const result = await Role.findByPk(role.id, { include: Permission });

    return res.json({ ok: true, role: result });
  },

  destroy: async (req, res) => {
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      return res.status(400).json({ ok: false, msg: "Rol no encontrado" });
    }

    try {
      await role.destroy();
    } catch (err) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ha ocurrido un error al eliminar" });
    }

    return res.json({ ok: true, role });
  },
};
