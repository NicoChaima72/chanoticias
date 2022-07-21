const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const { Op } = require("sequelize");
const uniqid = require("uniqid");
const helpers = require("../../helpers/back");
const emailService = require("../../services/email.service");

module.exports = {
  index: async (req, res) => {
    const users = await User.findAll({
      include: {
        model: Role,
        where: { description: { [Op.ne]: "SUPER_ADMIN_ROLE" } },
      },
    });
    return res.json({ ok: true, users });
  },
  create: (req, res) => {
    return res.json({ ok: true, msg: "Show create user form" });
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
    const user = await User.findByPk(user_id, { include: Role });
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

    return res.json({ ok: true, user, msg: "Mostrando form edit user" });
  },
  update: async (req, res) => {
    const { user_id } = req.params;
    const { name } = req.body;
    const user = await User.findByPk(user_id, { include: Role });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    await user.update({ name });

    return res.json({ ok: true, user });
  },
  destroy: async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, { include: Role });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    await user.update({ isActive: 2 });

    return res.json({ ok: true, user });
  },
};
