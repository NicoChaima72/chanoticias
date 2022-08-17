const express = require("express");
const router = express.Router();

const news = require("../../controllers/panel/news.controller");
const News = require("../../models/news.model");
const Tag = require("../../models/tag.model");
const newsRequest = require("../../requests/panel/news.request");
const { uploadFileMiddleware } = require("../../services/images.service");

// router.get("/example",async (req,res) => {
//   const news = await News.findByPk(8, {include: Tag})
//   const tag = await Tag.findByPk(2)
//   const result = await news.addTags([2])
//   // await news.addTags(tag)
//   // await news.addTags([tag])

//   // const tags = await news.getTags();
//   // const result = await news.setTags([tag])
//   res.json({ok:true, result})
// });

router.get("/", news.index);
router.get("/verify", news.indexVerify);
router.get("/create", news.create);
router.post("/",
 uploadFileMiddleware, 
 newsRequest.store,
  news.store);
router.get("/:news_slug", news.showVerify);
router.put(
  "/:news_slug/verify",
  uploadFileMiddleware,
  newsRequest.verify,
  news.verify
);
router.get("/:news_slug/edit", news.edit);
router.put(
  "/:news_slug",
  uploadFileMiddleware,
  newsRequest.update,
  news.update
);
router.delete("/:news_slug", news.destroy);

module.exports = router;
