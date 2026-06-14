const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '', maxlength: 5000 },
  skills:      { type: [String], default: [] },
  maxMembers:  { type: Number, default: 4, min: 1, max: 10 },

  leader:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // optional once a supervisor has accepted a SupervisionRequest
  supervisor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  supervisorStatus:  { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' },

  status:      { type: String, enum: ['open', 'closed', 'submitted', 'approved'], default: 'open' },
}, { timestamps: true });

projectSchema.virtual('currentMembers').get(function() {
  return (this.members?.length || 0) + 1; // +1 for leader
});

projectSchema.set('toJSON',   { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
