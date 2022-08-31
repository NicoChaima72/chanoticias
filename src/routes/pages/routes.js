const express = require("express");
const router = express.Router();
const pages = require("../../controllers/pages.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const Category = require("../../models/category.model");
const News = require("../../models/news.model");
// const newsApi = require("../../controllers/api/news.controller");

router.use(async (req, res, next) => {
  req.app.set("layout", "layouts/layout.html");
  const categories = await Category.findAll({
    order: [["popularity", "DESC"]],
  });
  const lastNews = await News.findAll({
    order: [["createdAt", "DESC"]],
    limit: 6,
    where: { status: 1 },
  });

  res.locals._lastNews = lastNews;
  res.locals._categories = categories;
  next();
});

router.get("/", pages.index);
router.get("/last-news", pages.lastNews);
router.get("/news/:news_slug", pages.showNews);
// router.put("/news/:news_slug/saved", newsApi.saved);
router.get("/categories/:category_slug", pages.showCategory);
router.get("/tags/:tag_slug", pages.showTag);
router.get('/search', pages.search);
router.get('/saved-news', pages.savedNews);

router.all('*', (req, res) => {
  return res.render('404/404.html');
});

module.exports = router;
