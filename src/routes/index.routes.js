const express = require("express");
const authRoute = require("./auth.routes");
const panelRoute = require("./panel/routes");
const apiRoute = require("./api/routes");
const router = express.Router();
const pages = require('./pages.routes')
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = (app) => {
  router.use("/api", apiRoute);
  router.use("/auth", authRoute);
  router.use("/panel", panelRoute);

  // router.get("/", authMiddleware.isAuthenticated, (req, res) => {
  //   return res.json({ ok: "Hello world!" });
  // });
  router.use('/', pages)

  return router;
};
