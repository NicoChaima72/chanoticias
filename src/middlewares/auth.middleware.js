exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ ok: false, msg: "Por favor iniciar sesion" });
};

exports.isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return next();

  return res.status(403).json({ ok: false, msg: "Ya has iniciado sesion"})
}