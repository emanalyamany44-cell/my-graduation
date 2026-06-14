const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  project:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  folder:   { type: String, default: 'General' },
  name:     { type: String, required: true },
  storedName: { type: String, required: true },
  mime:     { type: String, default: '' },
  size:     { type: Number, default: 0 },
  url:      { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FileDoc', schema);
