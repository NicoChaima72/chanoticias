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

    const { name, email, password, role_id } = req.body;
    let user;

    const existUser = await User.findOne({ where: { email } });

    if (existUser) {
      req.flash("data", req.body);
      req.flash("errors", {
        email: { message: "El email ya está registrado" },
      });
      return res.redirect(req.header("Referer") || "/");
    }

    try {
      user = await User.create(
        {
          name,
          email,
          password,
          RoleId: 1,
          token: uniqid(),
        },
        { include: Role }
      );
    } catch (err) {
      return res.json({ ok: false, error: helpers.handleErrorSequelize(err) });
    }

    const confirmUrl = `${getHostname(req)}/auth/activate/${user.token}`;

    let error = false;
    await emailService
      .sendEmail({
        user,
        subject: `Confirma tu cuenta`,
        archive: "auth/confirmAccount",
        data: { confirmUrl },
      })
      .catch(async (err) => {
        console.log({ err });
        error = true;
        await user.destroy();
        req.flash("data", req.body);
        req.flash("error", "Ha ocurrido un error, intenta más tarde");
      });
    if (error) return res.redirect("/auth/login");

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

    const user = await User.scope("withStatus").findOne({ where: { token } });

    if (!user) {
      req.flash("error", "El token ingresado no es valido");
      return res.redirect("/auth/login");
    }

    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });

    if (user.status !== 0) {
      req.flash("warning", "Lo sentimos, no puedes ingresar a este recurso");
      return res.redirect("/auth/login");
    }

    //es un cliente
    if (user.RoleId === 1) await user.update({ status: 1, token: null });
    else await user.update({ status: 3, token: null });

    req.flash("success", "Cuenta verificada, puedes iniciar sesion");
    return res.redirect("/auth/login");
  },

  showForgetPasswordForm: (req, res) => {
    return res.render("auth/forget-password.html");
  },

  forgetPassword: async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      req.flash("data", req.body);
      req.flash("errors", {
        email: { message: "El email no está registrado" },
      });
      return res.redirect(req.header("Referer") || "/");
    }

    if (user.status === 2) {
      return res
        .status(400)
        .json({ ok: false, msg: "El usuario está dado de baja" });
    }

    user.token = uniqid();
    user.expire = Date.now() + 1000 * 60 * 60 * 2; // 2 horas

    await user.save();

    const confirmUrl = `${getHostname(req)}/auth/forget-password/${user.token}`;

    let error = false;
    await emailService
      .sendEmail({
        user,
        subject: `Recuperar contraseña`,
        archive: "auth/forgetPassword",
        data: { confirmUrl },
      })
      .catch((err) => {
        console.log(err);
        error = true;
        req.flash("data", req.body);
        req.flash("error", "Ha ocurrido un error, intenta más tarde");
      });
    if (error) return res.redirect(req.header("Referer") || "/");

    req.flash(
      "success",
      "Se ha enviado un email a la direccion de correo proporcionada para el cambio de contraseña, tendrás 2 horas para hacerlo o el link expirará"
    );

    return res.redirect("/auth/login");
  },

  showUpdatePasswordForm: async (req, res) => {
    const { token } = req.params;
    const { by } = req.body;

    // Para cuando el usuario tenga status 3
    if (!token) {
      console.log("ENTRAAAA");
      return res.render("auth/update-password.html", {
        user: req.user,
        by: "id",
      });
    }

    const user = await User.scope("withToken").findOne({
      where: { token, expire: { [Op.gte]: Date.now() } },
    });

    if (!user) {
      req.flash("error", "El token ingresado no es valido");
      return res.redirect("/auth/login");
    }
    if (user.status === 2) {
      req.flash("error", "El usuario está dado de baja");
      return res.redirect("/auth/login");
    }

    return res.render("auth/update-password.html", { user, by: "token" });
  },

  updatePassword: async (req, res) => {
    const { param } = req.params;
    const { password, by } = req.body;

    let user;

    if (by == "token") {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
      });

      user = await User.scope("withAllInfo").findOne({
        where: { token: param, expire: { [Op.gte]: Date.now() } },
      });

      if (!user) {
        req.flash("error", "El token ha expirado");
        return res.redirect(req.header("Referer") || "/");
      }
    } else {
      user = await User.scope("withAllInfo").findOne({
        where: { id: req.user.id },
      });
    }

    if (user.status == 2) {
      req.flash(
        "danger",
        "El usuario está dado de baja y no se puede actualizar"
      );
      return res.redirect(req.header("Referer"));
    }

    await user.update({
      password,
      token: null,
      expire: null,
      isActive: 1,
      status: 1,
    });

    req.flash("success", "Contraseña cambiada con exito");
    if (by === "token") {
      return res.redirect("/auth/login");
    }
    return res.redirect("/");
  },
  logout: async (req, res) => {
    console.log(req.user.Role.description === "USER_ROLE");
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect(
        "/"
        // req.user.Role.description === "USER_ROLE"
        //   ? req.header("Referer") || "/"
        //   : "/"
      );
    });
  },
};
