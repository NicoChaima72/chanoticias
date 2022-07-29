exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  req.flash("warning", "No estás autenticado");
  return res.redirect("/auth/login");
};

exports.isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return next();

  req.flash("warning", "Ya estás autenticado");
  return res.redirect("/");
};
