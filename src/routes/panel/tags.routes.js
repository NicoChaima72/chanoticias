const express = require("express");
const router = express.Router();
const tags = require("../../controllers/panel/tags.controller");
const tagsRequest = require("../../requests/panel/tags.request");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

router.get("/", permissionsMiddleware.can("listar etiquetas"), tags.index);
router.get(
  "/create",
  permissionsMiddleware.can("agregar noticia"),
  tags.create
);
router.post(
  "/",
  permissionsMiddleware.can("agregar noticia"),
  tagsRequest.storeAndUpdate,
  tags.store
);
router.delete(
  "/:tag_slug",
  permissionsMiddleware.can("eliminar etiqueta"),
  tags.destroy
);

module.exports = router;
