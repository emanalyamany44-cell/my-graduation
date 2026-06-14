const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  body:    { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });

module.exports = mongoose.model('Message', schema);
