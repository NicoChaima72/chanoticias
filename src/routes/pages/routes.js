const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
  req.app.set('layout', "layouts/layout.html");
  next();
});

router.get("/", (req, res) => {
  return res.render("home.html");
});

router.all('*', (req, res) => {
  res.status(404).send('<h1>404! Pagina no encontrada en pagesRouter</h1>');
});

module.exports = router