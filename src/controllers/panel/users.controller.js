const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const { Op } = require("sequelize");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");
const emailService = require("../../services/email.service");
const Permission = require("../../models/permission.model");
const News = require("../../models/news.model");
const Saved_News = require("../../models/saved_news.model");

module.exports = {
  index: async (req, res) => {
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
        Saved_News,
      ],
    });

    return res.render("panel/pages/users/index-clients.html", {
      users,
    });
  },

  create: async (req, res) => {
    const roles = await Role.findAll({
      where: {
        slug: {
          [Op.notIn]: [
            "cliente",
            req.user.Role.slug !== "super-administrador"
              ? "super-administrador"
              : "",
            !helpers.can(req.user, "agregar usuarios administradores")
              ? "administrador"
              : "",
          ],
        },
      },
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

    if (!existRole) {
      req.flash("data", req.body);
      req.flash("error", "El rol no existe");
      return res.redirect(req.header("Referer") || "/");
    }

    if (
      (existRole.slug === "super-administrador" &&
        req.user.Role.slug !== "super-administrador") ||
      (existRole.slug === "administrador" &&
        !helpers.can(req.user, "agregar usuarios administradores"))
    ) {
      req.flash("error", "No tienes permisos para realizar esta accion");
      return res.redirect(req.header("Referer") || "/");
    }

    const existUser = await User.findOne({ where: { email } });

    if (existUser) {
      req.flash("data", req.body);
      req.flash("errors", {
        email: { message: "El email ya está registrado" },
      });
      return res.redirect(req.header("Referer") || "/");
    }

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
        subject: `Confirma tu cuenta`,
        archive: "auth/confirmAccount",
        data: { confirmUrl, email: user.email, password: password },
      })
      .then((info) => {
        req.flash(
          "success",
          "Usuario creado, Se ha enviado un correo a el nuevo usuario con su informacion."
        );
        return res.redirect("/panel/users");
      })
      .catch(async (err) => {
        await user.destroy();
        req.flash("data", req.body);
        req.flash("error", "Ha ocurrido un error, intenta más tarde");
        return res.redirect(req.header("Referer") || "/");
      });
  },
  // show: async (req, res) => {
  //   const { user_id } = req.params;
  //   const user = await User.findByPk(user_id, {
  //     include: { model: Role, include: Permission },
  //   });
  //   if (!user) {
  //     req.flash("warning", "El usuario no existe.");
  //     return res.redirect("/panel/users");
  //   }

  //   return res.json({ ok: true, user });
  // },
  edit: async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, { include: Role });

    if (!user) {
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
    }

    if (user.id === req.user.id) {
      req.flash("warning", "No te puedes editar a ti mismo.");
      return res.redirect("/panel/users");
    }

    // return res.json({ ok: true, user });
    if (user.RoleId === 2) {
      // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a super administradores.");
      return res.redirect("/panel/users");
    }
    if (user.RoleId === 1) {
      // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a clientes.");
      return res.redirect("/panel/users");
    }

    // Solo los super administradores pueden editar administradores
    if (user.RoleId === 3 && req.user.RoleId !== 2) {
      req.flash("warning", "No puedes editar a administradores.");
      return res.redirect("/panel/users");
    }

    // return res.json({ ok: true, user });

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
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
    }

    if (user.id === req.user.id) {
      req.flash("warning", "No te puedes editar a ti mismo.");
      return res.redirect("/panel/users");
    }

    if (user.RoleId === 2) {
      // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a super administradores.");
      return res.redirect("/panel/users");
    }
    if (user.RoleId === 1) {
      // SUPER ADMINISTRADOR
      req.flash("warning", "No puedes editar a clientes.");
      return res.redirect("/panel/users");
    }

    // Solo los super administradores pueden editar administradores
    if (user.RoleId === 3 && req.user.RoleId !== 2) {
      req.flash("warning", "No puedes editar a administradores.");
      return res.redirect("/panel/users");
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

  // destroy: async (req, res) => {
  //   const { user_id } = req.params;
  //   const user = await User.findByPk(user_id, { include: Role });
  //   if (!user) {
  //     req.flash("warning", "El usuario no existe.");
  //     return res.redirect("/panel/users");
  //   }

  //   await user.update({ status: 2 });

  //   return res.json({ ok: true, user });
  // },

  changeStatus: async (req, res) => {
    const { user_id } = req.params;
    const { type } = req.body;

    const user = await User.scope("withStatus").findByPk(user_id, {
      include: [Role, News],
    });

    if (!user) {
      req.flash("warning", "El usuario no existe.");
      return res.redirect("/panel/users");
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
    return res.redirect(
      "/panel/users" + (type === "clients" ? "/clients" : "")
    );
  },
};
