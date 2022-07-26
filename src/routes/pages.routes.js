const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
  req.app.set('layout', "layouts/layout.html");
  next();
});

router.get("/", (req, res) => {
  res.render("home.html");
});

module.exports = router