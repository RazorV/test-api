const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function (req, res, next) {

  if (req.user && req.user._id) {
    User.findOne({_id: req.user._id}).exec(function (err, user) {
      if (err) return next(err);
      if (user) {
        req.user = user.toObject();
        if (req.user.role && req.user.role.roleId) {
          next();
          // user role validation do there
        } else {
          next();
        }
      } else {
        next();
      }
    });
  } else {
    next();
  }
};
