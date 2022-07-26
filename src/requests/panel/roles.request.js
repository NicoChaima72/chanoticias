const validate = require("../request");

module.exports = {
  storeAndUpdate: (req, res, next) => {
    const validationRule = {
      description: "required",
      permissions: "required",
    };

    const customMessages = {
      "required.permissions": "Los permisos son requeridos",
    };

    return validate(req.body, validationRule, customMessages, req, res, next);
  },
};
