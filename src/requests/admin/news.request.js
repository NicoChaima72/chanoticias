const validate = require("../request");

module.exports = {
  store: (req, res, next) => {
    const validationRule = {
      title: "required",
      excerpt: "required",
      body: "required",
    };

    return validate(req.body, validationRule.body, {}, req, res, next);
  },
};
