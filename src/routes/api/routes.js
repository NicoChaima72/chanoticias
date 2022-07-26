const express = require("express");
const router = express.Router();
const imagesRouter = require("./images.routes");

router.use("/images", imagesRouter);

router.all('*', (req, res) => {
  res.status(404).send('<h1>404! Pagina no encontrada en ApiRouter</h1>');
});

module.exports = router;
