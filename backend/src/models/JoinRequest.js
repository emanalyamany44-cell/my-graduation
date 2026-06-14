const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  message:   { type: String, default: '', maxlength: 500 },
  status:    { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending', index: true },
}, { timestamps: true });

schema.index({ project: 1, student: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', schema);
