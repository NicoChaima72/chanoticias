const express = require("express");
const usersRouter = require("./users.routes");
const categoriesRouter = require("./categories.routes");
const newsRouter = require("./news.routes");
const tagsRouter = require("./tags.routes");
const rolesRouter = require("./roles.routes");
const permissionsRouter = require("./permissions.routes");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");

const router = express.Router();

router.use((req, res, next) => {
  // changing layout for my admin panel
  req.app.set("layout", "panel/layouts/layout.html");
  next();
});

router.get("/", (req, res) => {
  return res.render("panel/home.html");
});

router.use("/users", permissionsMiddleware.canGroup("usuarios"), usersRouter);
router.use(
  "/categories",
  permissionsMiddleware.canGroup("categorias"),
  categoriesRouter
);
router.use("/news", permissionsMiddleware.canGroup("noticias"), newsRouter);
router.use("/tags", permissionsMiddleware.canGroup("etiquetas"), tagsRouter);
router.use("/roles", permissionsMiddleware.canGroup("roles"), rolesRouter);
router.use(
  "/permissions",
  permissionsMiddleware.canGroup("permisos"),
  permissionsRouter
);

// router.all('*', (req, res) => {
//   res.status(404).send('<h1>404! Pagina no encontrada en PanelRouter</h1>');
// });

module.exports = router;
