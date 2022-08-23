const db = require("../config/database.config");

require("../models/user.model");
require("../models/role.model");
require("../models/category.model");
require("../models/tag.model");
require("../models/news.model");
require("../models/news_tag.model");
require("../models/permission_role.model");
require("../models/permission_user.model");
require("../models/news_highlights");


db.sync({ alter: true })
  .then(() => console.log("Connect to database :)"))
  .catch((err) => {
    throw err;
  });
