const express = require("express");
const router = express.Router();
const pages = require('../../controllers/pages.controller')
const authMiddleware  = require('../../middlewares/auth.middleware');

router.use((req, res, next) => {
  req.app.set("layout", "layouts/layout.html");
  next();
});

router.get("/", pages.index);
router.get("/news/:news_slug", pages.showNews);
router.get("/categories/:category_slug", pages.showCategory);
router.get("/tags/:tag_slug", pages.showTag);


// TODO: Agregar 404
// router.all('*', (req, res) => {
//   res.status(404).send('<h1>404! Pagina no encontrada en pagesRouter</h1>');
// });

module.exports = router;
