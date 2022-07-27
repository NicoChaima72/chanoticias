const express = require("express");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const passport = require("../config/passport.config");
const routes = require("../routes/index.routes");

module.exports = (app) => {
  // database
  require("../database/database");

  // settings
  app.set("port", process.env.PORT);
  app.set("views", path.join(path.dirname(__dirname), "views"));
  app.engine("html", ejs.renderFile);
  app.set("view engine", "ejs");
  app.use(expressLayouts);
  app.set("layout extractScripts", true);
  // configurando en cada una de las rutas principales ver: panel/routes.js
  app.set("layout", "layouts/layout.html");

  // middlewares
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
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

  // config extra
  app.use(express.static(path.join(__dirname, "../../public")));
  app.use('/flowbite', express.static(path.join(__dirname, "../../node_modules/flowbite/dist")));

  // routes
  app.use(routes(app));


  return app;
};
