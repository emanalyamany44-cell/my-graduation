const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:  { type: String, enum: [
    'join_request', 'join_accepted', 'join_rejected',
    'supervision_request', 'supervision_accepted', 'supervision_rejected',
    'project_updated', 'member_removed', 'message'
  ], required: true },
  title: { type: String, required: true },
  body:  { type: String, default: '' },
  link:  { type: String, default: '' },
  read:  { type: Boolean, default: false, index: true },
  meta:  { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Notification', schema);
