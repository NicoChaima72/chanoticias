const validate = require("../request");

module.exports = {
  upload: (req, res, next) => {
    const validationRule = {
      files: "array|required",
    };
    const customMessages = {
      "required.files": "El archivo es obligatorio",
    };

    return validate(req, validationRule, customMessages, req, res, next);
  },
};
