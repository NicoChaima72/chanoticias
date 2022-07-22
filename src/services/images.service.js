const AWS = require("aws-sdk");
const uniqid = require("uniqid");

const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, {});
  },
});

const uploadFileMiddleware = multer({ storage }).array("file");
// const singleUpload = multer({ storage }).single("file");

// ------------------------------------------------------------

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  Bucket: process.env.AWS_S3_BUCKET_NAME,
});

const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    Bucket_Path = process.env.AWS_S3_BUCKET_NAME;
    const ResponseData = [];

    file.map((item) => {
      const extension = item.originalname.substring(
        item.originalname.lastIndexOf(".")
      );
      const params = {
        Bucket: Bucket_Path,
        Key: uniqid() + extension,
        Body: item.buffer,
        // ACL:'public-read'
      };

      s3.upload(params, function (err, data) {
        if (err) reject({ ok: false, Message: err });
        else {
          ResponseData.push(data);
          if (ResponseData.length == file.length) {
            resolve({ ok: true, Data: ResponseData });
          }

          reject({ ok: false });
        }
      });
    });
  });
};

const deleteImage = (key) => {
  const params = { Key: key, Bucket: process.env.AWS_S3_BUCKET_NAME };
  return s3.deleteObject(params).promise();
};

module.exports = {
  uploadImage,
  uploadFileMiddleware,
  deleteImage
};
