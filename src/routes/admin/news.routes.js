const express = require("express");
const router = express.Router();

const news = require("../../controllers/admin/news.controller");
const newsRequest = require("../../requests/admin/news.request");
const { uploadFileMiddleware } = require("../../services/images.service");

router.get("/", news.index);
router.get("/create", news.create);
router.post("/", uploadFileMiddleware, newsRequest.store, news.store);
router.get("/:news_slug", news.show);
router.get("/:news_slug/edit", news.edit);
router.put("/:news_slug", uploadFileMiddleware, newsRequest.update, news.update);
router.delete("/:news_slug", news.destroy);

module.exports = router;
