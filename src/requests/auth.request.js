const validate = require("./request");

module.exports = {
  login: (req, res, next) => {
    const validationRule = {
      email: "required",
      password: "required",
    };

    return validate(req.body, validationRule, {}, req, res, next);
  },
  register: (req, res, next) => {
    const validationRule = {
      name: "required",
      email: "required|email",
      password: "required|min:8|confirmed",
      password_confirmation: "required",
      // role_id: "required|integer",
    };

    const customMessages = {
      "confirmed.password": "Las contraseñas no coinciden",
      // "required.role_id": "El rol del usuario es requerido",
    };

    return validate(req.body, validationRule, customMessages, req, res, next);
  },
  forgetPassword: (req, res, next) => {
    const validationRule = {
      email: "required|email",
    };

    return validate(req.body, validationRule, {}, req, res, next);
  },
  updatePassword: (req, res, next) => {
    const validationRule = {
      password: "required|min:8|confirmed",
      password_confirmation: "required",
    };

    const customMessages = {
      "confirmed.password": "Las contraseñas no coinciden",
    };

    return validate(req.body, validationRule, customMessages, req, res, next);
  },
};
