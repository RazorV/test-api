const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');
const mongoose = require('mongoose');
const User = mongoose.model("User");

// sample user, used for authentication
const user = {
  username: 'react',
  password: 'express'
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // Ideally you'll fetch this from the db
  // Idea here was to show how jwt works with simplicity
  if (req.body.username === user.username && req.body.password === user.password) {
    const token = jwt.sign({
      username: user.username
    }, config.jwtSecret);
    return res.json({
      token,
      username: user.username
    });
  }

  User.findOne({
    deleted: false
  }).or([
    {username: req.body.login},
    {email: req.body.login}
  ]).exec(function (err, user) {
    if (err) return res.serverError(err);
    if (!user) return res.notFound("User not found");
    user.authenticateUser(req.body.password || "", function (err, isMatch) {
      if (err) return res.serverError(err);
      if (!isMatch) return res.forbidden();

      res.ok({
        user: user,
        token: res.jwt({
          id: user.id
        }).token
      });
    });
  });

  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
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
