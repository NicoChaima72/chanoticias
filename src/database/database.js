const db = require("../config/database.config");

require("../models/user.model");
require("../models/role.model");

db.sync({ alter: true })
  .then(() => console.log("Connect to database :)"))
  .catch((err) => {
    throw err;
  });
