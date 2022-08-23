const express = require("express");
const router = express.Router();
const categories = require("../../controllers/panel/categories.controller");
const categoriesRequest = require("../../requests/panel/categories.request");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

router.get(
  "/",
  permissionsMiddleware.can("listar categorias"),
  categories.index
);

router.get(
  "/create",
  permissionsMiddleware.can("agregar categoria"),
  categories.create
);

router.post(
  "/",
  permissionsMiddleware.can("agregar categorias"),
  categoriesRequest.store,
  categories.store
);

router.get(
  "/:category_slug/edit",
  permissionsMiddleware.can("editar categoria"),
  categories.edit
);

router.put(
  "/:category_slug",
  permissionsMiddleware.can("editar categoria"),
  categoriesRequest.update,
  categories.update
);

router.delete(
  "/:category_slug",
  permissionsMiddleware.can("eliminar categoria"),
  categories.destroy
);

router.put(
  "/:category_slug/active",
  permissionsMiddleware.can("editar categoria"),
  categories.active
);

module.exports = router;
