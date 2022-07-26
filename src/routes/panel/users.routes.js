const express = require("express");
const users = require("../../controllers/panel/users.controller");
const usersRequest = require("../../requests/panel/users.request");

const router = express.Router();

router.get("/", users.index);
router.get("/create", users.create);
router.post("/", usersRequest.store, users.store);
router.get("/:user_id", users.show);
router.get("/:user_id/edit", users.edit);
router.put("/:user_id", usersRequest.update, users.update);
router.delete("/:user_id", users.destroy);

module.exports = router;
