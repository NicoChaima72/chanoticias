const express = require("express");
const router = express.Router();
const imagesRequest = require("../../requests/api/images.request");
const images = require("../../controllers/api/images.controller");
const { uploadFileMiddleware } = require("../../services/images.service");

router.post("/upload", uploadFileMiddleware, imagesRequest.upload, images.upload);

module.exports = router;
