const express = require("express");
const usersRouter = require("./users.routes");
const categoriesRouter = require("./categories.routes");
const newsRouter = require("./news.routes");
const tagsRouter = require("./tags.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true, msg: "Admin" });
});

router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/news", newsRouter);
router.use("/tags", tagsRouter);

module.exports = router;
