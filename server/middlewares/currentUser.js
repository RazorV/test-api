const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function (req, res, next) {

  if (req.jwt && req.jwt.payload && req.jwt.payload.id && req.jwt.valid) {
    User.findOne({_id: req.jwt.payload.id}).exec(function (err, user) {
      if (err) return next(err);
      if (user) {
        req.user = user.toObject();
        if (req.user.role && req.user.role.roleId) {
          // let model = null;
          // let criteria = {};
          // if (req.user.role.globalRole) {
          //   model = rootMongoConnection.model('RootRole');
          //   criteria = {_id: req.user.role.roleId, status: true};
          // } else {
          //   model = mongoose.model('Role');
          //   criteria = {_id: req.user.role.roleId};
          // }
          // model.findOne(criteria).exec(function (err, role) {
          //   if (err) return next(err);
          //   if (!role) {
          //     req.user.role.access = {};
          //   } else {
          //     req.user.role.access = role.toObject().accessSpecs;
          //   }
          //   next();
          // });
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
