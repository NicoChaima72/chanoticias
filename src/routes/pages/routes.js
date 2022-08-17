const express = require("express");
const router = express.Router();
const pages = require('../../controllers/pages.controller')
const authMiddleware  = require('../../middlewares/auth.middleware');
const Category = require("../../models/category.model");
const News = require("../../models/news.model");



router.use(async (req, res, next) => {
  req.app.set("layout", "layouts/layout.html");
  const categories = await Category.findAll({order: [['popularity', 'DESC']]});
  const lastNews = await News.findAll({order:[['createdAt', 'DESC']], limit: 5})

  res.locals._lastNews = lastNews; 
  res.locals._categories = categories; 
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
