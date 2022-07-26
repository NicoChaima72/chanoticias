const express = require("express");
const router = express.Router();
const roles = require("../../controllers/panel/roles.controller");
const rolesRequest = require("../../requests/panel/roles.request");

router.get("/", roles.index);
router.get("/create", roles.create);
router.post("/", rolesRequest.storeAndUpdate, roles.store);
router.get("/:role_slug", roles.show);
router.get("/:role_slug/edit", roles.edit);
router.put("/:role_slug", rolesRequest.storeAndUpdate, roles.update);
router.delete("/:role_slug", roles.destroy);

module.exports = router;
