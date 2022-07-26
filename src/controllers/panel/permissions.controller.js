const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
const User = require("../../models/user.model");
const sequelize = require("sequelize");
const News = require("../../models/news.model");
const Tag = require("../../models/tag.model");

module.exports = {
  listUsers: async (req, res) => {
    const users = await User.findAll({ include: [Permission, { model: Role, include: Permission }] });

    res.json({ ok: true });
  },

  getUser: async (req, res) => {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      include: [Permission, { model: Role, include: Permission }],
    });

    return res.json({ ok: true, permissions: user.getWithAllPermissions() });
  },

  setPermissions: async (req, res) => {
    const { user_id } = req.params;
    let { permissions: permissionsSendByPost } = req.body;

    const user = await User.findByPk(user_id, {
      include: [{ model: Role, include: Permission }, Permission],
    });

    permissionsSendByPost = permissionsSendByPost.map((permission) =>
      Number(permission)
    );

    const permissionsByRole = user.Role.Permissions.map(
      (permission) => permission.id
    );

    // que no contiene el permiso por rol pero se lo quieren agregar
    let permissionsToAdd = permissionsSendByPost.filter((permission) => {
      return !permissionsByRole.includes(permission);
    });

    // que contiene el permiso por rol pero se lo quieren quitar
    let permissionsToRemove = permissionsByRole.filter((permission) => {
      return !permissionsSendByPost.includes(permission);
    });

    permissionsToAdd = permissionsToAdd.map((permission) => ({
      id: permission,
      action: "add",
    }));

    permissionsToRemove = permissionsToRemove.map((permission) => ({
      id: permission,
      action: "remove",
    }));

    permissionsToAdd.concat(permissionsToRemove).map(async (permission) => {
      await user.addPermissions(permission.id, {
        through: { action: permission.action },
      });
    });

    return res.json({
      ok: true,
      permissionsSendByPost,
      permissionsByRole,
      permissionsToAdd,
      permissionsToRemove,
    });
  },
};
