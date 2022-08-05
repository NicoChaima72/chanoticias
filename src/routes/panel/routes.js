const express = require("express");
const usersRouter = require("./users.routes");
const categoriesRouter = require("./categories.routes");
const newsRouter = require("./news.routes");
const tagsRouter = require("./tags.routes");
const rolesRouter = require("./roles.routes");
const permissionsRouter = require("./permissions.routes");

const router = express.Router();

router.use((req, res, next) => {
  // changing layout for my admin panel
  req.app.set('layout', "panel/layouts/layout.html");
  next();
});

router.get("/", (req, res) => {
  return res.render('panel/home.html');
});

router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/news", newsRouter);
router.use("/tags", tagsRouter);
router.use("/roles", rolesRouter);
router.use("/permissions", permissionsRouter);

// router.all('*', (req, res) => {
//   res.status(404).send('<h1>404! Pagina no encontrada en PanelRouter</h1>');
// });

module.exports = router;
