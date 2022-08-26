const validate = require("../request");

module.exports = {
  store: (req, res, next) => {
    const validationRule = {
      title: "required",
      excerpt: "required",
      file: "required",
      body: "required",
      category_id: "required",
    };
    const customMessages = {
      "required.file": "La imagen es obligatoria",
    };

    return validate(
      { ...req.body, file: req.files ? req.files[0] : null },
      validationRule,
      customMessages,
      req,
      res,
      next
    );
  },
  update: (req, res, next) => {
    const validationRule = {
      title: "required",
      excerpt: "required",
      body: "required",
      category_id: "required",
    };

    return validate(req.body, validationRule, {}, req, res, next);
  },
  verify: (req, res, next) => {
    const validationRule = {
      title: "required",
      excerpt: "required",
      body: "required",
      category_id: "required",
      // popularity: "required",
      action: 'required'
    };

    return validate(req.body, validationRule, {}, req, res, next);
  },

};
