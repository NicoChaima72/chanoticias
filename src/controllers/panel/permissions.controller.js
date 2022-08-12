const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
const User = require("../../models/user.model");
const sequelize = require("sequelize");
const News = require("../../models/news.model");
const Tag = require("../../models/tag.model");
const { separateByValue } = require("../../helpers/back");

module.exports = {
  editPermissions: async (req, res) => {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      include: [Permission, { model: Role, include: Permission }],
    });

    const permissionsByUser = user
      .getWithAllPermissions()
      .AllPermissions.map((p) => p.id);

    const permissionsByRole = user.Role.Permissions.map((p) => p.id);

    const permissions = await Permission.findAll();

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
