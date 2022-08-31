const express = require("express");
const router = express.Router();
const authRoute = require("./auth.routes");
const panelRoute = require("./panel/routes");
const apiRoute = require("./api/routes");
const pagesRoute = require("./pages/routes");
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = (app) => {
  router.use("/api", apiRoute);
  router.use("/auth", authMiddleware.verifyStatus, authRoute);
  router.use(
    "/panel",
    authMiddleware.verifyStatus,
    authMiddleware.enterPanel,
    panelRoute
  );

  // router.get("/", authMiddleware.isAuthenticated, (req, res) => {
  //   return res.json({ ok: "Hello world!" });
  // });
  router.use("/", authMiddleware.verifyStatus, pagesRoute);

  // router.all('*', (req, res) => {
  //   res.status(404).send('<h1>404! Page not found</h1>');
  // });

  return router;
};
