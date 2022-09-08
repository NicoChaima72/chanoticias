const express = require("express");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
// const passport = require("../config/passport.config");
const passport = require("passport");
const mysqlSession = require("express-mysql-session");
const routes = require("../routes/routes");

module.exports = (app) => {
  // database
  require("../database/database");

  // settings
  app.set("port", process.env.PORT);
  app.set("views", path.join(path.dirname(__dirname), "views"));
  app.engine("html", ejs.renderFile);
  app.set("view engine", "ejs");
  app.use(expressLayouts);
  // app.set("layout extractScripts", true);
  // configurando en cada una de las rutas principales ver: panel/routes.js
  // app.set("layout", "layouts/layout.html");

  // middlewares
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride("_method"));
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: new mysqlSession({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
      }),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // global variables
  const helpers = require("../helpers/front");
  app.use((req, res, next) => {
    res.locals._ = helpers;
    res.locals._title = "Chaimanoticias";
    res.locals._user = req.user || null;
    res.locals.flash_success = req.flash("success");
    res.locals.flash_warning = req.flash("warning");
    res.locals.flash_error = req.flash("error");
    res.locals.data = req.flash("data");
    res.locals.errors = req.flash("errors");
    res.locals._current_url = req.url;
    if (res.locals.data.length > 0) res.locals.data = res.locals.data[0];
    if (res.locals.errors.length > 0) res.locals.errors = res.locals.errors[0];

    next();
  });

  // config extra
  app.use(express.static(path.join(__dirname, "../../public")));
  app.use('/adminlte/dist', express.static(path.join(__dirname, "../../node_modules/admin-lte/dist")));
  app.use('/adminlte/plugins', express.static(path.join(__dirname, "../../node_modules/admin-lte/plugins")));
  app.use(
    "/flowbite",
    express.static(path.join(__dirname, "../../node_modules/flowbite/dist"))
  );

  // routes
  app.use(routes(app));

  return app;
};
