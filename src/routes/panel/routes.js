const express = require("express");
const usersRouter = require("./users.routes");
const categoriesRouter = require("./categories.routes");
const newsRouter = require("./news.routes");
const tagsRouter = require("./tags.routes");
const rolesRouter = require("./roles.routes");
const permissionsRouter = require("./permissions.routes");
const permissionsMiddleware = require("../../middlewares/permissions.middleware");
const News = require("../../models/news.model");
const { Op } = require("sequelize");
const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const Category = require("../../models/category.model");
const Tag = require("../../models/tag.model");

const router = express.Router();

router.use(async (req, res, next) => {
  // changing layout for my admin panel
  req.app.set("layout", "panel/layouts/layout.ejs");
  const unverifiedNews = await News.findAndCountAll({
    where: { status: 0 },
  });

  res.locals._unverifiedNews = unverifiedNews;

  next();
});

router.get("/", async (req, res) => {
  let allNews = News.findAndCountAll({
    where: { status: 1 },
  });
  let myNews = News.findAndCountAll({
    where: { [Op.and]: [{ status: 1 }, { UserId: req.user.id }] },
  });
  let unverifiedNews = News.findAndCountAll({
    where: { status: 0 },
  });
  let myUnverifiedNews = News.findAndCountAll({
    where: { [Op.and]: [{ status: 0 }, { UserId: req.user.id }] },
  });

  let clients = User.findAndCountAll({
    where: { RoleId: 1 },
  });
  let roles = Role.findAndCountAll();

  let users = User.findAndCountAll({
    where: { [Op.and]: [{ status: 1 }, { roleId: { [Op.ne]: 1 } }] },
  });
  let categories = Category.findAndCountAll({
    where: { isActive: 1 },
  });
  let tags = Tag.findAndCountAll();

  [
    allNews,
    myNews,
    unverifiedNews,
    myUnverifiedNews,
    clients,
    roles,
    users,
    categories,
    tags,
  ] = await Promise.all([
    allNews,
    myNews,
    unverifiedNews,
    myUnverifiedNews,
    clients,
    roles,
    users,
    categories,
    tags,
  ]);

  return res.render("panel/home.ejs", {
    allNews,
    myNews,
    clients,
    unverifiedNews,
    myUnverifiedNews,
    roles,
    users,
    categories,
    tags,
  });
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

router.all("*", (req, res) => {
  res.render("panel/404/404.ejs");
});

module.exports = router;
