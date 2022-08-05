require("../config/passport.config");
const uniqid = require("uniqid");
const { Op } = require("sequelize");

const User = require("../models/user.model");
const helpers = require("../helpers/back");
const emailService = require("../services/email.service");
const passport = require("passport");
const Role = require("../models/role.model");
const back = require("../helpers/back");
const { getHostname } = require("../helpers/back");

module.exports = {
  showLoginForm: (req, res) => {
    return res.render("auth/login.html");
  },

  // login: (req, res, next) => {
  //   passport.authenticate("local.signin", function (err, user, info) {
  //     if (err) return res.status(401).json({ ok: false, message: err });
  //     if (!user) {
  //       return res.status(401).json({ ok: false, message: info.msg });
  //     }
  //     console.log(req);
  //     return res.json({ ok: true, user });
  //   })(req, res, next);
  // },

  login: (req, res, next) => {
    const { redirect } = req.query;

    try {
      passport.authenticate("local.signin", {
        successRedirect: redirect ? redirect : "/",
        failureRedirect: "/auth/login",
        failureFlash: true,
      })(req, res, next);
    } catch (err) {
      backURL = req.header("Referer") || "/";
      req.flash("data", req.body);
      req.flash("errors", helpers.handleErrorSequelize(err));
    }
  },

  showRegisterForm: (req, res) => {
    return res.render("auth/register.html");
  },

  register: async (req, res) => {
    const { redirect } = req.query;
    // TODO: Solo role cliente normal ya que loscon rol especial los creara automaticamente el administrador
    const { name, email, password, role_id } = req.body;
    let user;

    const existUser = await User.findOne({ where: { email } });

    if (existUser) {
      req.flash("data", req.body);
      req.flash("errors", {
        email: { message: "El email ya está registrado" },
      });
      return res.redirect(req.header("Referer") || "/");

      return res.json({
        ok: false,
        msg: "El usuario con este email ya existe",
      });
    }

    try {
      user = await User.create(
        {
          name,
          email,
          password,
          RoleId: role_id ? role_id : 2,
          token: uniqid(),
        },
        { include: Role }
      );
    } catch (err) {
      return res.json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    const confirmUrl = `${getHostname(req)}/auth/activate/${user.token}`;

    emailService
      .sendEmail({
        user,
        subject: "Confirma tu cuenta",
        body: `Confirma tu cuenta: ${confirmUrl}`,
      })
      .catch(async (err) => {
        await user.destroy();
        return res.status(408).json({
          ok: false,
          msg: "Ha ocurrido un error, intenta más tarde",
          err,
        });
      });

    req.flash(
      "success",
      "Cuenta creada, se ha enviado un correo para habilitar la cuenta"
    );
    return res.redirect(
      `/auth/login${redirect ? "?redirect=" + redirect : ""}`
    );
  },

  activate: async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ where: { token } });

    if (!user) {
      req.flash("error", "El token ingresado no es valido");
      return res.redirect("/auth/login");
    }

    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });

    await user.update({ isActive: 1, token: null });

    req.flash("success", "Cuenta verificada, puedes iniciar sesion");
    return res.redirect("/auth/login");
  },

  showForgetPasswordForm: (req, res) => {
    return res.render("auth/forget-password.html");
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

    const confirmUrl = `${getHostname(req)}/auth/forget-password/${user.token}`;

    emailService
      .sendEmail({
        user,
        subject: "Recuperar contraseña",
        body: `Has solicitado recuperar contraseña, sigue el siguiente link: ${confirmUrl}, este tendrá un tiempo de expiracion de 2 horas`,
      })
      .catch((err) => {
        return res.status(408).json({
          ok: false,
          msg: "Ha ocurrido un error, intenta más tarde",
          err,
        });
      });

    req.flash(
      "success",
      "Se ha enviado un email a la direccion de correo proporcionada para el cambio de contraseña, tendrás 2 horas para hacerlo o el link expirará"
    );

    return res.redirect("/auth/login");
  },

  showUpdatePasswordForm: async (req, res) => {
    const { token } = req.params;
    const user = await User.scope("withToken").findOne({
      where: { token, expire: { [Op.gte]: Date.now() } },
    });

    if (!user) {
      req.flash("error", "El token ingresado no es valido");
      return res.redirect("/auth/login");
    }

    return res.render("auth/update-password.html", { user });
  },

  updatePassword: async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });

    const user = await User.scope("withAllInfo").findOne({
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
    req.flash(
      "success",
      "Contraseña cambiada con exito, puedes iniciar sesion"
    );
    return res.redirect("/auth/login");
  },
  logout: async (req, res) => {
    console.log(req.user.Role.description === "USER_ROLE");
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect(
        req.user.Role.description === "USER_ROLE"
          ? req.header("Referer") || "/"
          : "/"
      );
    });
  },
};
