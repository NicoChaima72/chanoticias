require("../config/passport.config");
const uniqid = require("uniqid");
const { Op } = require("sequelize");

const User = require("../models/user.model");
const helpers = require("../helpers/back");
const emailService = require("../services/email.service");
const passport = require("passport");
const Role = require("../models/role.model");

module.exports = {
  showLoginForm: (req, res) => {
    res.json({ ok: "show login" });
  },

  login: (req, res, next) => {
    passport.authenticate("local.signin", function (err, user, info) {
      if (err) return res.status(401).json({ ok: false, message: err });
      if (!user) {
        return res.status(401).json({ ok: false, message: info.msg });
      }
      console.log(req);
      return res.json({ ok: true, user });
    })(req, res, next);
  },

  showRegisterForm: (req, res) => {
    res.json({ ok: "show register" });
  },

  register: async (req, res) => {
    // TODO: Solo role cliente normal ya que loscon rol especial los creara automaticamente el administrador
    const { name, email, password, role_id } = req.body;
    let user;

    const existUser = await User.findOne({ where: { email } });

    if (existUser)
      return res.json({
        ok: false,
        msg: "El usuario con este email ya existe",
      });

    try {
      user = await User.create(
        {
          name,
          email,
          password,
          RoleId: role_id,
          token: uniqid(),
        },
        { include: Role }
      );
    } catch (err) {
      return res.json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    const confirmUrl = `${req.protocol}://${req.hostname}${
      req.hostname === "localhost" && ":" + process.env.PORT
    }/auth/activate/${user.token}`;

    emailService
      .sendEmail({
        user,
        subject: "Confirma tu cuenta",
        body: `Confirma tu cuenta: ${confirmUrl}`,
      })
      .then((info) => {
        return res.json({
          ok: true,
          msg: "Se ha enviado un correo para habilitar la cuenta",
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

  activate: async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ where: { token } });

    if (!user) {
      return res.status(403).json({ ok: false, msg: "Token expirado" });
    }

    await user.update({ isActive: 1, token: null });

    return res.json({
      ok: true,
      msg: "Cuenta verificada, puedes iniciar sesion",
    });
  },

  showForgetPasswordForm: (req, res) => {
    res.json({ ok: true, msg: "Mostrando olvide mi contraseña" });
  },

  forgetPassword: async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ ok: false, msg: "El email no está registrado" });
    }

    user.token = uniqid();
    user.expire = Date.now() + 1000 * 60 * 60 * 2; // 2 horas

    await user.save();

    const confirmUrl = `${req.protocol}://${req.hostname}${
      req.hostname === "localhost" && ":" + process.env.PORT
    }/auth/forget-password/${user.token}`;

    emailService
      .sendEmail({
        user,
        subject: "Recuperar contraseña",
        body: `Has solicitado recuperar contraseña, sigue el siguiente link: ${confirmUrl}, este tendrá un tiempo de expiracion de 2 horas`,
      })
      .then((info) => {
        return res.json({
          ok: true,
          msg: "Se ha enviado un email a la direccion de correo proporcionada para el cambio de contraseña, tendrás 2 horas para hacerlo o el link expirará",
        });
      })
      .catch((err) => {
        return res.status(408).json({
          ok: false,
          msg: "Ha ocurrido un error, intenta más tarde",
          err,
        });
      });
  },

  showUpdatePasswordForm: (req, res) => {
    res.json({ ok: true, msg: "Mostrando actualizar mi contraseña" });
  },

  updatePassword: async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      where: { token, expire: { [Op.gte]: Date.now() } },
    });

    if (!user) {
      return res.status(403).json({ ok: false, msg: "Token expirado" });
    }

    await user.update({
      password,
      token: null,
      expire: null,
      isActive: 1,
    });

    return res.json({ ok: true, msg: "Contraseña cambiada con exito" });
  },
};
