const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');
const mongoose = require('mongoose');
const User = mongoose.model("User");

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  User.findOne({
    deleted: false
  }).or([
    {userName: req.body.username},
    {email: req.body.username}
  ]).exec(function (err, user) {
    // console.log(user, err);
    if (err) return next(err);
    if (!user) {
      const err = new APIError('User not found', httpStatus.NOT_FOUND, true);
      return next(err);
    }
    user.authenticateUser(req.body.password || "", function (err, isMatch) {
      if (err) return next(err);
      if (!isMatch) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
      }

      res.json({
        user: user,
        token: user.createToken()
      });
    });
  });

}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = { login, getRandomNumber };
