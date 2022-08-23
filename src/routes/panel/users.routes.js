const express = require("express");
const users = require("../../controllers/panel/users.controller");
const usersRequest = require("../../requests/panel/users.request");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

const router = express.Router();

router.get(
  "/",
  permissionsMiddleware.can([
    "listar usuarios",
    "listar usuarios administradores",
  ]),
  users.index
);

router.get(
  "/clients",
  permissionsMiddleware.can("listar clientes"),
  users.indexClients
);

router.get(
  "/create",
  permissionsMiddleware.can([
    "agregar usuarios",
    "agregar usuarios administradores",
  ]),
  users.create
);

router.post(
  "/",
  permissionsMiddleware.can([
    "agregar usuarios",
    "agregar usuarios administradores",
  ]),
  usersRequest.store,
  users.store
);

router.get(
  "/:user_id/edit",
  permissionsMiddleware.can([
    "editar usuarios",
    "editar usuarios administradores",
  ]),
  users.edit
);
router.put(
  "/:user_id",
  permissionsMiddleware.can([
    "editar usuarios",
    "editar usuarios administradores",
  ]),
  usersRequest.update,
  users.update
);
router.put(
  "/:user_id/status",
  permissionsMiddleware.can([
    "dar de baja a usuarios",
    "dar de baja a clientes",
    "dar de baja a usuarios administradores",
  ]),
  users.changeStatus
);

module.exports = router;
