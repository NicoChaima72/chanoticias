const express = require("express");
const router = express.Router();
const roles = require("../../controllers/panel/roles.controller");
const rolesRequest = require("../../requests/panel/roles.request");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

router.get("/", permissionsMiddleware.can("listar roles"), roles.index);
router.get("/create", permissionsMiddleware.can("agregar rol"), roles.create);
router.post(
  "/",
  permissionsMiddleware.can("agregar rol"),
  rolesRequest.storeAndUpdate,
  roles.store
);
router.get("/:role_slug", permissionsMiddleware.can("ver rol"), roles.show);
router.get(
  "/:role_slug/edit",
  permissionsMiddleware.can("editar rol"),
  roles.edit
);
router.put(
  "/:role_slug",
  permissionsMiddleware.can("editar rol"),
  rolesRequest.storeAndUpdate,
  roles.update
);
router.delete(
  "/:role_slug",
  permissionsMiddleware.can("eliminar rol"),
  roles.destroy
);

module.exports = router;
