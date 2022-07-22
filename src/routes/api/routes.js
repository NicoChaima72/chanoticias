const express = require("express");
const router = express.Router();
const imagesRouter = require("./images.routes");

router.use("/images", imagesRouter);

module.exports = router;
