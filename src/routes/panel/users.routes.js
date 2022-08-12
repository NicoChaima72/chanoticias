const express = require("express");
const users = require("../../controllers/panel/users.controller");
const usersRequest = require("../../requests/panel/users.request");

const router = express.Router();

router.get("/", users.index);
router.get("/clients", users.indexClients);
router.get("/create", users.create);
router.post("/", usersRequest.store, users.store);
router.get("/:user_id", users.show);
router.get("/:user_id/edit", users.edit);
router.put("/:user_id", usersRequest.update, users.update);
router.put("/:user_id/status", users.changeStatus);

module.exports = router;
