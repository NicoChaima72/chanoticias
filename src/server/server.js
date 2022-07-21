const express = require("express");
const methodOverride = require("method-override");
const flash = require("connect-flash");
// const session = require("express-session");
const session = require("cookie-session");
const path = require("path");
const passport = require("../config/passport.config");
const routes = require("../routes/index.routes");

module.exports = (app) => {
  // database
  require("../database/database");

  // settings
  app.set("port", process.env.PORT);

  // middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(methodOverride("_method"));
  app.use(flash());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // global variables
  const helpers = require("../helpers/front");
  app.use((req, res, next) => {
    res.locals.title = "Chaimanoticias";
    res.locals.user = req.user || null;
    res.locals.helpers = helpers;

    next();
  });

  // routes
  app.use(routes(app));

  // config extra
  app.use(express.static(path.join(__dirname, "../public")));

  return app;
};
