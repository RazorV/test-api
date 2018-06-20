const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fd: {
    type: String,
  },
  fileName: {
    type: String,
  },
  type: {
    type: String,
  },
  size: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
}, {
  strict: false
});

// fileSchema.plugin(CustomFieldValidator, {});
module.exports = mongoose.model('TempFile', fileSchema);
