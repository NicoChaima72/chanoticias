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
        return done(null, false, {
          msg: "Ha ocurrido un error, intenta más tarde",
        });
      }

      if (!user) {
        return done(null, false, { msg: "El email no está registrado" });
      }

      if (!user.verifyPassword(password)) {
        return done(null, false, { msg: "La contraseña es incorrecta" });
      }

      if (user.isActive != 1) {
        return done(null, false, { msg: "No está activo" });
      }

      return done(null, user.getWithAllPermissions());
    }
  )
);

passport.serializeUser(async (user, done) => {
  done(null, user.getWithAllPermissions());
});

passport.deserializeUser(async (user, done) => {
  try {
    user = await User.scope("withAllInfo").findOne({
      where: { email },
      include: [Permission, { model: Role, include: Permission }],
    });
    done(null, user.getWithAllPermissions());
  } catch (e) {
    return done(null, false, {});
  }
});

module.exports = passport;
