const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Role = require('./role.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt  = require('jsonwebtoken');
const config = require('../../config/config');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required!'],
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'FirstName is required!'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'LastName is required!'],
    trim: true,
  },
  userName: {
    type: String,
    required: [true, 'UserName is required!'],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    trim: true,
    minlength: [6, 'Password need to be longer!'],
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
UserSchema.method({
  /**
   * other simple options to hash and compare password.
   */
  // _hashPassword(password) {
  //   return hashSync(password);
  // },
  // authenticateUser(password) {
  //   return compareSync(password, this.password);
  // },

  createToken() {
    return jwt.sign(
      {
        _id: this._id,
      },
      config.jwtSecret,
    );
  },
  // _hashPassword(password) {
  //   return hashSync(password);
  // },
  authenticateUser(password, next) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
      console.log(isMatch);
      if (err) return next(err, isMatch);
      return next(err, isMatch);
    });
  },
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('role')
      .exec()
      .then((user) => {
        if (user && user.deleted !== true) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find({status: true})
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

UserSchema.pre("save", function (next) {
  console.log('pre save');
  // this.deleted = true;
  const user = this;
  if (user.isNew) {
    user.restorePasswordHash = crypto.createHash('md5').update(user.email + "::" + Date.now()).digest("hex");
  }
  if (user.isModified('password')) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else
    next();
});

UserSchema.post("save", function () {
  console.log('post save hook');
});
//
// UserSchema.pre("count", function (next) {
//   this.where({deleted: false});
//   next();
// });
UserSchema.pre("find", function () {
  this.deleted = false;
  console.log('Update query --------------------------');
});

UserSchema.post("find", function (result) {
  console.log(result, 'We found something --------------------------');
});

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
