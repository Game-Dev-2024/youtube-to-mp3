const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileImg:String,
  originName: String,
  fileName: String,
  filePath: String,
  dateTime: { type: Date, default: Date.now },
  artist: String,
  quote: String,
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
