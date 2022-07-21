const express = require("express");
const router = express.Router();

const news = require("../../controllers/admin/news.controller");
const newsRequest = require("../../requests/admin/news.request");

router.get("/", news.index);
router.get("/create", news.create);
router.post("/", newsRequest.store, news.store);
router.get("/:news_slug", news.show);
router.get("/:news_slug/edit", news.edit);
router.put("/:news_slug", news.update);
router.delete("/", news.destroy);

module.exports = router;
