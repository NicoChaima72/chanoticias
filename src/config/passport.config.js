const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Permission = require("../models/permission.model");

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      let user = null;
      try {
        user = await User.scope("withAllInfo").findOne({
          where: { email },
          include: [Permission, { model: Role, include: Permission }],
        });
      } catch (e) {
        req.flash("error", helpers.handleErrorSequelize(e));
        return done(null, false, {});
      }

      if (!user) {
        req.flash("data", { email, password });
        req.flash("error", "Usuario y/o contraseña incorrectos");
        return done(null, false, {});
      }

      if (!user.verifyPassword(password)) {
        req.flash("data", { email, password });
        req.flash("error", "Usuario y/o contraseña incorrectos");
        return done(null, false, {});
      }

      if (user.status != 1 && user.status != 3) {
        req.flash("data", { email });
        req.flash("error", "Usuario no activo, verifica tu correo");
        return done(null, false, {});
      }

      return done(null, user.getWithAllPermissions());
    }
  )
);

passport.serializeUser(async (user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  try {
    user = await User.scope("withAllInfo").findOne({
      where: { email: user.email },
      include: [Permission, { model: Role, include: Permission }],
    });
    done(null, user.getWithAllPermissions());
  } catch (e) {
    return done(null, false, {});
  }
});

module.exports = passport;
