const express = require("express");
const router = express.Router();
const authRoute = require("./auth.routes");
const panelRoute = require("./panel/routes");
const apiRoute = require("./api/routes");
const pagesRoute = require("./pages/routes");
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = (app) => {
  router.use("/api", apiRoute);
  router.use("/auth", authRoute);
  router.use(
    "/panel",
    authMiddleware.verifyStatus,
    authMiddleware.enterPanel,
    panelRoute
  );
  router.use("/", authMiddleware.verifyStatus, pagesRoute);

  return router;
};
