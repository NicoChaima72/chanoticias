const validate = require("../request");

module.exports = {
  storeAndUpdate: (req, res, next) => {
    const validationRule = {
      name: "required",
    };

    const customMessages = {
      "required.name": "El nombre del tag es obligatorio",
    };

    return validate(req.body, validationRule, customMessages, req, res, next);
  },
};
