const validator = require("../helpers/validate");

module.exports = (data, rules, customMessages, req, res, next) => {
  const value = validator(data, rules, customMessages, (err, result) => {
    if (err) {
      // console.log({ err });
      // backURL = req.header("Referer") || "/";
      // req.flash("data", req.body);
      // req.flash("errors", err);
      // return res.redirect(backURL);
      return res.status(400).json({ ok: false, err });
    }

    next();
  });
};
