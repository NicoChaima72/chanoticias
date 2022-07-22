const express = require("express");
const router = express.Router();
const tags = require("../../controllers/admin/tags.controller");
const tagsRequest = require("../../requests/admin/tags.request");

router.get("/", tags.index);
router.get("/create", tags.create);
router.post("/", tagsRequest.storeAndUpdate, tags.store);
router.get("/:tag_slug", tags.show);
router.get("/:tag_slug/edit", tags.edit);
router.put("/:tag_slug", tagsRequest.storeAndUpdate, tags.update);
router.delete("/:tag_slug", tags.destroy);

module.exports = router;
