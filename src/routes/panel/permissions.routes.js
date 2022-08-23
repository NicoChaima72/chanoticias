const express = require("express");
const router = express.Router();
const permission = require("../../controllers/panel/permissions.controller");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

router.get(
  "/users/:user_id",
  permissionsMiddleware.can("vincular permiso a usuarios"),
  permission.editPermissions
);
router.post(
  "/users/:user_id",
  permissionsMiddleware.can("vincular permiso a usuarios"),
  permission.updatePermissions
);

module.exports = router;
