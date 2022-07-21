const express = require("express");
const authRoute = require("./auth.routes");
const adminRoute = require("./admin/routes");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = (app) => {
  router.use("/auth", authRoute);
  router.use("/admin", adminRoute);

  router.get("/", authMiddleware.isAuthenticated, (req, res) => {
    res.json({ ok: "Hello world!" });
  });

  return router;
};
