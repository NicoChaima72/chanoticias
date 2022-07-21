const express = require("express");
const passport = require("passport");
const auth = require("../controllers/auth.controller");
const authRequest = require("../requests/auth.request");

const router = express.Router();

router.get(
  "/login",
  // passport.authenticate("local.signin", { failureMessage: true }),
  auth.login
);
router.post("/login", authRequest.login, auth.login);

router.get("/register", auth.showRegisterForm);
router.post("/register", authRequest.register, auth.register);

router.get("/activate/:token", auth.activate);

router.get("/forget-password", auth.showForgetPasswordForm);
router.post(
  "/forget-password",
  authRequest.forgetPassword,
  auth.forgetPassword
);

router.get("/forget-password/:token", auth.showUpdatePasswordForm);
router.post(
  "/forget-password/:token",
  authRequest.updatePassword,
  auth.updatePassword
);

module.exports = router;
