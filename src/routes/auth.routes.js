const express = require("express");
const passport = require("passport");
const auth = require("../controllers/auth.controller");
const authRequest = require("../requests/auth.request");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/login", authMiddleware.isNotAuthenticated, auth.showLoginForm);
router.post(
  "/login",
  authMiddleware.isNotAuthenticated,
  authRequest.login,
  auth.login
);

router.get(
  "/register",
  authMiddleware.isNotAuthenticated,
  auth.showRegisterForm
);
router.post(
  "/register",
  authMiddleware.isNotAuthenticated,
  authRequest.register,
  auth.register
);

router.get("/activate/:token", auth.activate);

router.get(
  "/forget-password",
  authMiddleware.isNotAuthenticated,
  auth.showForgetPasswordForm
);
router.post(
  "/forget-password",
  authMiddleware.isNotAuthenticated,
  authRequest.forgetPassword,
  auth.forgetPassword
);

router.get("/forget-password/:token", auth.showUpdatePasswordForm);
router.post(
  "/forget-password/:token",
  authRequest.updatePassword,
  auth.updatePassword
);

router.post("/logout", authMiddleware.isAuthenticated, auth.logout);

module.exports = router;
