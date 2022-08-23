const express = require("express");
const router = express.Router();

const news = require("../../controllers/panel/news.controller");
const News = require("../../models/news.model");
const Tag = require("../../models/tag.model");
const newsRequest = require("../../requests/panel/news.request");
const { uploadFileMiddleware } = require("../../services/images.service");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

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

router.get(
  "/",
  permissionsMiddleware.can("listar todas las noticias"),
  news.index
);
// TODO: SOLO PARA MIS NOTICIAS
router.get("/me", permissionsMiddleware.can("listar mis noticias"), news.index);

router.get(
  "/user/:user_id",
  permissionsMiddleware.can("listar todas las noticias"),
  news.showByUser
);
router.get(
  "/category/:category_slug",
  permissionsMiddleware.can("listar todas las noticias"),
  news.showByCategory
);

router.get(
  "/tag/:tag_slug",
  permissionsMiddleware.can("listar todas las noticias"),
  news.showByTag
);
router.get(
  "/verify",
  permissionsMiddleware.can("verificar noticias"),
  news.indexVerify
);
router.get(
  "/create",
  permissionsMiddleware.can("agregar noticia"),
  news.create
);
router.post(
  "/",
  permissionsMiddleware.can("agregar noticia"),
  uploadFileMiddleware,
  newsRequest.store,
  news.store
);
router.get(
  "/:news_slug",
  permissionsMiddleware.can("verificar noticias"),
  news.showVerify
);
router.put(
  "/:news_slug/verify",
  permissionsMiddleware.can("verificar noticias"),
  uploadFileMiddleware,
  newsRequest.verify,
  news.verify
);
router.put(
  "/:news_slug/highlight",
  permissionsMiddleware.can("editar destacadas"),
  news.highlight
);
router.get(
  "/:news_slug/edit",
  permissionsMiddleware.can([
    "editar todas las noticias",
    "editar mis noticias",
  ]),
  news.edit
);
router.put(
  "/:news_slug",
  permissionsMiddleware.can([
    "editar todas las noticias",
    "editar mis noticias",
  ]),
  uploadFileMiddleware,
  newsRequest.update,
  news.update
);
router.delete("/:news_slug",permissionsMiddleware.can([
  "eliminar todas las noticias",
  "eliminar mis noticias",
]), news.destroy);

module.exports = router;
