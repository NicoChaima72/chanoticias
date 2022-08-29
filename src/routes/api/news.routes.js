const express = require("express");
const router = express.Router();
const news = require("../../controllers/api/news.controller");

router.post("/:news_id/saved", news.saved);

module.exports = router;
