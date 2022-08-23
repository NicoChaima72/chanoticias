const Permission = require("../../models/permission.model");
const Role = require("../../models/role.model");
const helpers = require("../../helpers/back");
const slugify = require("slugify");
const Sequelize = require("sequelize");
const User = require("../../models/user.model");
const { separateByValue } = require("../../helpers/back");

module.exports = {
  index: async (req, res) => {
    // const roles = await Role.findAll({
    //   group: ["Role.id"],
    //   includeIgnoreAttributes: false,
    //   include: [
    //     { model: Permission },
    //   ],
    //   attributes: {
    //     include: [
    //       [Sequelize.fn("COUNT", Sequelize.col("Permissions.id")), "Permissions_Count"],
    //     ],
    //   },
    //   logging: console.log,
    // });

    const roles = await Role.findAll({ include: [Permission, User] });

    return res.render("panel/pages/roles/index.html", { roles });
    return res.render("panel/pages/roles/index.html", {
      roles: JSON.parse(JSON.stringify(roles)),
    });
  },

  create: async (req, res) => {
    const permissions = await Permission.findAll();

    return res.render("panel/pages/roles/form.html", {
      action: "create",
      role: {},
      permissions: separateByValue(permissions, "group"),
    });
  },

  store: async (req, res, next) => {
    const { description, permissions } = req.body;

    const existRole = await Role.findOne({ where: { description } });

    if (existRole) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un rol con esta descripcion" });
    }

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

    req.flash("success", "Se ha agregado el rol exitosamente.");
    return res.redirect("/panel/roles");
  },

  show: async (req, res) => {
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      req.flash("warning", "El rol no existe.");
      return res.redirect("/panel/roles");
    }

    const permissions = await Permission.findAll();

    return res.render("panel/pages/roles/form.html", {
      action: "show",
      role,
      permissions: separateByValue(permissions, "group"),
    });
  },

  edit: async (req, res) => {
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      req.flash("warning", "El rol no existe.");
      return res.redirect("/panel/roles");
    }

    const permissions = await Permission.findAll();

    return res.render("panel/pages/roles/form.html", {
      action: "edit",
      role,
      permissions: separateByValue(permissions, "group"),
    });
  },

  update: async (req, res) => {
    const { description, permissions } = req.body;
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: [Permission, { model: User, include: Permission }],
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

    // Actualizar los usuarios con los permisos personalizados segun corresponda
    // ----------------------------------------------------------------

    const previousPermissions = [...role.Permissions].map((p) => p.id);
    const newPermissions = [...permissions].map((p) => Number(p));

    const permissionsToAdd = newPermissions.filter(
      (p) => !previousPermissions.includes(p)
    );
    const permissionsToRemove = previousPermissions.filter(
      (p) => !newPermissions.includes(p)
    );

    const users = role.Users;
    users.forEach(async (user) => {
      const permissionsUser = user.Permissions.map((p) => p.id);
      const permissionsUserToRemove = [];
      user.Permissions.forEach((permission) => {
        if (newPermissions.includes(permission.id)) {
          console.log(permission.id);
          if (
            permission.Permission_User.action == "add" &&
            permissionsToAdd.includes(permission.id)
          ) {
            permissionsUserToRemove.push(permission.id);
          }
          if (
            permission.Permission_User.action == "remove" &&
            permissionsToRemove.includes(permission.id)
          ) {
            permissionsUserToRemove.push(permission.id);
          }
        }
      });
      const permissionsUserToKeep = permissionsUser.filter(
        (permission) => !permissionsUserToRemove.includes(permission)
      );

      await user.setPermissions(permissionsUserToKeep);
    });

    // ---------------------------------------------------------------------------

    await role.setPermissions(permissions);

    req.flash("success", "Se ha actualizado el rol exitosamente.");
    return res.redirect("/panel/roles");
  },

  destroy: async (req, res) => {
    const { role_slug } = req.params;

    const role = await Role.findOne({
      where: { slug: role_slug },
      include: Permission,
    });

    if (!role) {
      req.flash("warning", "El rol no existe.");
      return res.redirect("/panel/roles");
    }

    try {
      await role.destroy();
    } catch (err) {
      req.flash("warning", "Ha ocurrido un error, intente más tarde.");
      return res.redirect("/panel/roles");
    }

    req.flash("success", "El rol " + role.description + " se ha eliminado.");
    return res.redirect("/panel/roles");
  },
};
