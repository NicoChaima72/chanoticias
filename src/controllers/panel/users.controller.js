const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const { Op } = require("sequelize");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");
const emailService = require("../../services/email.service");
const Permission = require("../../models/permission.model");
const News = require("../../models/news.model");

module.exports = {
  index: async (req, res) => {
    // TODO: Cambiar por su respectivo rol
    const users = await User.scope("withStatus").findAll({
      include: [
        {
          model: Role,
          where: { slug: { [Op.ne]: "cliente" } },
        },
        Permission,
        News,
      ],
    });

    return res.render("panel/pages/users/index.html", {
      users,
    });
  },

  indexClients: async (req, res) => {
    const users = await User.scope("withStatus").findAll({
      include: [
        {
          model: Role,
          where: { slug: "cliente" },
        },
        Permission,
      ],
    });

    return res.render("panel/pages/users/index-clients.html", {
      users,
    });
  },

  create: async (req, res) => {
    const roles = await Role.findAll({
      where: { slug: { [Op.ne]: "cliente" } },
    });
    return res.render("panel/pages/users/form.html", {
      user: {},
      action: "create",
      roles,
    });
  },
  store: async (req, res) => {
    const { name, email, role_id } = req.body;

    const existRole = await Role.findByPk(role_id);

    if (!existRole)
      return res.status(400).json({ ok: false, msg: "El rol no existe" });

    const existUser = await User.findOne({ where: { email } });

    if (existUser)
      return res.status(400).json({
        ok: false,
        msg: "El usuario con este email ya existe",
      });

    let user;

    const password = uniqid();

    try {
      user = await User.create(
        { name, email, password, RoleId: role_id, token: uniqid() },
        { include: Role }
      );
    } catch (err) {
      return res
        .status(400)
        .json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    const confirmUrl = `${req.protocol}://${req.hostname}${
      req.hostname === "localhost" && ":" + process.env.PORT
    }/auth/activate/${user.token}`;

    emailService
      .sendEmail({
        user,
        subject: "Confirma tu cuenta",
        body: `Confirma tu cuenta: ${confirmUrl} \n\nEmail: ${user.email}\nContraseña: ${password}`,
      })
      .then((info) => {
        req.flash(
          "success",
          "Usuario creado, Se ha enviado un correo a el nuevo usuario con su informacion."
        );
        return res.redirect("/panel/users");

        return res.json({
          ok: true,
          msg: "Se ha enviado un correo a el nuevo usuario con su informacion",
        });
      })
      .catch(async (err) => {
        await user.destroy();
        return res.status(408).json({
          ok: false,
          msg: "Ha ocurrido un error, intenta más tarde",
          err,
        });
      });
  },
  show: async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, {
      include: { model: Role, include: Permission },
    });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    return res.json({ ok: true, user });
  },
  edit: async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, { include: Role });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    const roles = await Role.findAll({
      where: { slug: { [Op.ne]: "cliente" } },
    });
    return res.render("panel/pages/users/form.html", {
      user,
      action: "edit",
      roles,
    });
  },
  update: async (req, res) => {
    const { user_id } = req.params;
    const { name, email, role_id } = req.body;
    const user = await User.findByPk(user_id, { include: [Role, Permission] });

    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Verificamos si existe ese email pero en otro usuario con otro id
    const verifyExistEmail = await User.findOne({
      where: { [Op.and]: [{ email }, { id: { [Op.ne]: user.id } }] },
    });

    if (verifyExistEmail) {
      req.flash("data", req.body);
      req.flash("errors", {
        email: { message: "El email ya está registrado" },
      });
      return res.redirect(req.header("Referer") || "/");
    }

    if (role_id != user.RoleId) {
      let permissionsByRole = await Role.findByPk(role_id, {
        include: Permission,
      });

      permissionsByRole = permissionsByRole.Permissions.map((p) => p.id);
      permissionsByUser = user.Permissions.map((p) => p.id);
      const noMatchPermissions = permissionsByUser.filter(
        (p) => !permissionsByRole.includes(p)
      );

      const permissionsToRemove = permissionsByUser.filter(
        (p) => !noMatchPermissions.includes(p)
      );

      await user.removePermissions(permissionsToRemove);
    }

    await user.update({ name, email, RoleId: role_id });

    req.flash(
      "success",
      `El usuario ${user.name} ha sido actualizado con exito`
    );
    return res.redirect("/panel/users");
  },

  destroy: async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, { include: Role });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    await user.update({ status: 2 });

    return res.json({ ok: true, user });
  },

  changeStatus: async (req, res) => {
    const { user_id } = req.params;
    const { type } = req.body;

    const user = await User.scope("withStatus").findByPk(user_id, {
      include: [Role, News],
    });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    if (user.status === 2) await user.update({ status: 1 });
    else await user.update({ status: 2 });

    req.flash(
      "success",
      "El usuario " +
        user.name +
        " ha sido dado de " +
        (user.status === 1 ? "alta." : "baja.")
    );
    return res.redirect("/panel/users" + (type === "clients" && "/clients"));
  },
};
