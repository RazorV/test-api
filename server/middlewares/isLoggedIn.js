module.exports = function (req, res, next) {
  if (req.jwt && req.jwt.payload && req.jwt.payload.id && req.jwt.valid && req.user) {
    next();
  } else {
    res.status(401).send("Login is required");
  }
};
