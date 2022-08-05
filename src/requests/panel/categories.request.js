const validate = require("../request");

module.exports = {
  store: (req, res, next) => {
    const validationRule = {
      name: "required",
      description: "required",
      color: "required",
      popularity: "required|integer|min:0|max:100",
    };

    return validate(req.body, validationRule, {}, req, res, next);
  },
  update: (req, res, next) => {
    const validationRule = {
      name: 'required',
      color: 'required',
      popularity: 'required|integer|min:0|max:100'
    }
    return validate(req.body, validationRule, {}, req, res, next);
  },
};
