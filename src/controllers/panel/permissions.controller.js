const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
const User = require("../../models/user.model");
const { Op } = require("sequelize");
const News = require("../../models/news.model");
const Tag = require("../../models/tag.model");
const { separateByValue } = require("../../helpers/back");

module.exports = {
  editPermissions: async (req, res) => {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      include: [Permission, { model: Role, include: Permission }],
    });

    if (!user) {
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
    }
    if (!user) {
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
    }

    if (user.id === req.user.id) {
      req.flash("warning", "No te puedes editar a ti mismo.");
      return res.redirect("/panel/users");
    }

    if (user.RoleId === 2) { // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a super administradores.");
      return res.redirect("/panel/users");
    }
    if (user.RoleId === 1) { // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a clientes.");
      return res.redirect("/panel/users");
    }

    // Solo los super administradores pueden editar administradores
    if (user.RoleId === 3 && req.user.RoleId !== 2) {
      req.flash("warning", "No puedes editar a administradores.");
      return res.redirect("/panel/users");
    }

    const permissionsByUser = user
      .getWithAllPermissions()
      .AllPermissions.map((p) => p.id);

    const permissionsByRole = user.Role.Permissions.map((p) => p.id);

    const permissions = await Permission.findAll({
      where: { protected: false },
    });

    return res.render("panel/pages/permissions/form.html", {
      user,
      permissions: separateByValue(permissions, "group"),
      permissionsByRole,
      permissionsByUser,
    });
  },

  updatePermissions: async (req, res) => {
    const { user_id } = req.params;
    let { permissions: permissionsSendByBody } = req.body;

    const user = await User.findByPk(user_id, {
      include: [{ model: Role, include: Permission }, Permission],
    });

    if (!user) {
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
    }

    if (user.id === req.user.id) {
      req.flash("warning", "No te puedes editar a ti mismo.");
      return res.redirect("/panel/users");
    }

    if (user.RoleId === 2) { // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a super administradores.");
      return res.redirect("/panel/users");
    }
    if (user.RoleId === 1) { // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a clientes.");
      return res.redirect("/panel/users");
    }

    // Solo los super administradores pueden editar administradores
    if (user.RoleId === 3 && req.user.RoleId !== 2) {
      req.flash("warning", "No puedes editar a administradores.");
      return res.redirect("/panel/users");
    }

    const thereAreProtectedPermissions = await Permission.findAll({
      where: {
        [Op.and]: [{ protected: true }, { id: { [Op.in]: permissionsSendByBody } }],
      },
    });
    if (thereAreProtectedPermissions.length > 0) {
      req.flash("error", "No se pueden agregar permisos protegidos");
      req.flash("data", req.body);
      return res.redirect(req.header("Referer") || "/");
    }

    permissionsSendByBody = permissionsSendByBody.map((permission) =>
      Number(permission)
    );

    const permissionsByRole = user.Role.Permissions.map(
      (permission) => permission.id
    );

    // que no contiene el permiso por rol pero se lo quieren agregar
    let permissionsToAdd = permissionsSendByBody.filter((permission) => {
      return !permissionsByRole.includes(permission);
    });

    // que contiene el permiso por rol pero se lo quieren quitar
    let permissionsToRemove = permissionsByRole.filter((permission) => {
      return !permissionsSendByBody.includes(permission);
    });

    // return res.json({
    //   ok: true,
    //   permissionsByRole,
    //   permissionsToAdd,
    //   permissionsToRemove,
    // });
    permissionsToAdd = permissionsToAdd.map((permission) => ({
      id: permission,
      action: "add",
    }));

    permissionsToRemove = permissionsToRemove.map((permission) => ({
      id: permission,
      action: "remove",
    }));

    await user.setPermissions([]);
    permissionsToAdd.concat(permissionsToRemove).map(async (permission) => {
      await user.addPermissions(permission.id, {
        through: { action: permission.action },
      });
    });

    req.flash(
      "success",
      "Los permisos para el usuario " + user.name + " se han guardado."
    );
    return res.redirect("/panel/users");
  },
};
