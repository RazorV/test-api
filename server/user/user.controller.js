const User = require('./user.model');
const paramValidation = require('../../config/param-validation');
const MailService = require ('../services/mail.service');
const fs = require ('fs');

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function create(req, res, next) {
  const user = new User(req.body);

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  user.username = req.body.username;
  user.mobileNumber = req.body.mobileNumber;
  user.role = req.body.role;

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}
/**
 * Send mail user.
 */
function email(req, res, next) {
  console.log(req.params);
  let ejs = require('ejs');
  let fileName = '/../views/emailTest.ejs';
  let fieldTemplate = fs.readFileSync(__dirname + fileName, 'utf-8');
  let content = ejs.render(fieldTemplate, {
    email: req.params.email || 'test@mail.com'
  });
  MailService.send(content, 'New message', req.params.email).then(function (resolve, reject) {
    console.log(reject, resolve);
    if (reject) {
      return next(reject);
    }
    res.json(resolve);
  });
}

module.exports = { load, get, create, update, list, remove, email };
