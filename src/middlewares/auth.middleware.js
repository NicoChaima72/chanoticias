exports.authenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("warning", "No estás autenticado");
    return res.redirect("/auth/login");
  }
  return next();
};

exports.notAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("warning", "Ya estás autenticado");
    return res.redirect("/");
  }

  return next();
};

// exports.can = (req, res, next) => {

// }

exports.verifyStatus = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.status == 3) {
      req.flash("warning", "Tienes que cambiar tu contraseña");
      return res.redirect("/auth/change-password");
    }
  }

  return next();
};

exports.enterPanel = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("warning", "No estás autenticado");
    return res.redirect("/auth/login");
  }
  
  if (req.user.Role.slug === 'cliente') {
    return res.redirect("/");
  };

  return next();
};
