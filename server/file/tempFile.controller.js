const mime = require('mime-types');
const path = require('path');
const TempFile = require('./tempFile');
const fs = require('fs');

function uploadFile(req, res, next) {
  const accept = req.body.accept || '';
  if (req.file === undefined) {
    return res.status(400).send({
      name: 'UploadError',
      error: 'Server cannot proceed this file'
    });
  }
  const filePath = req.file.destination + req.file.filename;
  if (accept) {
    const acceptItems = accept.split(',');
    let isAcceptMimeType = false;
    acceptItems.forEach((ext) => {
      if (mime.lookup(ext) === req.file.mimetype) {
        isAcceptMimeType = true;
      }
    });
    if (!isAcceptMimeType) {
      removeFile(filePath);
      return res.status(400).send({
        name: 'ValidationError',
        error: 'error.i18n.File type is not allowed'
      });
    }
  }

  if (req.file.size > 10 * 1024 * 1024) {
    removeFile(filePath);
    return res.status(400).send({
      name: 'ValidationError',
      message: 'File is too large. Max file size 10MB'
    });
  }

  const fileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webm', '.mp4', 'mov', 'ogg', '.mkv'];
  const filetypes = /.jpg|.jpeg|.png|.gif|.webm|.mp4|.mkv|.mov|.ogg/;
  const extname = filetypes.test(path.extname(req.file.originalname).toLowerCase());

  if (extname === false) {
    removeFile(filePath);
    return res.status(400).send({
      name: 'ValidationError',
      message: 'File upload only supports the following filetypes ' + fileExtensions.join(' ')
    });
  }
  const videoFiletypes = /.mp4|.webm|.mkv|.mov|.ogg/;
  const isVideoFile = videoFiletypes.test(path.extname(req.file.originalname).toLowerCase());
  console.log(isVideoFile);
  if (isVideoFile === true) {
    console.log(filePath);
    let ffmpeg = require('fluent-ffmpeg/index');
    ffmpeg.ffprobe(filePath, function(err, metadata) {
      if (metadata && metadata.format) {
        if (metadata.format.duration > 60) {
          removeFile(filePath);
          return res.status(400).send({
            name: 'ValidationError',
            message: 'Video file duration should be less than 1 minute'
          });
        }
      }
    });
  }

  const tempFile = new TempFile();
  tempFile.fd = req.file.path;
  tempFile.fileName = req.file.originalname;
  tempFile.size = req.file.size;
  tempFile.type = req.file.mimetype;
  return tempFile.save()
    .then(createdTempFile => res.json(createdTempFile))
    .catch(e => next(e));
}

function removeFile (filePath) {
  fs.unlink('./' + filePath);
}

module.exports = { uploadFile, removeFile };
