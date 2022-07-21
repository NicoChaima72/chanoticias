const express = require("express");
const router = express.Router();
const categories = require("../../controllers/admin/categories.controller");
const categoriesRequest = require("../../requests/admin/categories.request");

router.get("/", categories.index);
router.get("/create", categories.create);
router.post("/", categoriesRequest.store, categories.store);
router.get("/:category_slug", categories.show);
router.get("/:category_slug/edit", categories.edit);
router.put("/:category_slug", categoriesRequest.update, categories.update);
router.put("/:category_slug/active", categories.active);

module.exports = router;
