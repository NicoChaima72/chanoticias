const express = require("express");
const passport = require("passport");
const auth = require("../controllers/auth.controller");
const authRequest = require("../requests/auth.request");
const authMiddleware = require("../middlewares/auth.middleware");
const Category = require("../models/category.model");
const News = require("../models/news.model");

const router = express.Router();

router.use(async (req, res, next) => {
  req.app.set("layout", "layouts/layout.html");
  const categories = await Category.findAll({
    order: [["popularity", "DESC"]],
  });
  const lastNews = await News.findAll({
    order: [["createdAt", "DESC"]],
    limit: 5,
  });

  res.locals._lastNews = lastNews;
  res.locals._categories = categories;
  next();
});

router.get("/login", authMiddleware.notAuthenticated, auth.showLoginForm);
router.post(
  "/login",
  authMiddleware.notAuthenticated,
  authRequest.login,
  auth.login
);

router.get("/register", authMiddleware.notAuthenticated, auth.showRegisterForm);
router.post(
  "/register",
  authMiddleware.notAuthenticated,
  authRequest.register,
  auth.register
);

router.get("/activate/:token", auth.activate);

router.get(
  "/forget-password",
  authMiddleware.notAuthenticated,
  auth.showForgetPasswordForm
);
router.post(
  "/forget-password",
  authMiddleware.notAuthenticated,
  authRequest.forgetPassword,
  auth.forgetPassword
);

router.get("/forget-password/:token", auth.showUpdatePasswordForm);
router.post(
  "/update-password/:param",
  authRequest.updatePassword,
  auth.updatePassword
);

router.get("/change-password", auth.showUpdatePasswordForm);

router.post("/logout", authMiddleware.authenticated, auth.logout);

module.exports = router;
