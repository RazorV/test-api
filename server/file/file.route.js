const express = require('express');
const multer = require('multer');
const tempFileController = require('./tempFile.controller');
const config = require('../../config/config');

const uploader = multer({ storage: multer.diskStorage({
  destination: function dest(req, file, callback) { callback(null, config.tempUploadDir);},
  filename: function filename(req, file, callback) { callback(null, Date.now() + '_' + file.originalname); }})
}).single('file');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/upload')
  .post(uploader, tempFileController.uploadFile);

module.exports = router;
