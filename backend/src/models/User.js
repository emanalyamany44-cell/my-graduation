const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName:   { type: String, required: true, trim: true, maxlength: 100 },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password:   { type: String, required: true, select: false },
  role:       { type: String, enum: ['student', 'supervisor'], required: true, index: true },
  department: { type: String, trim: true, default: '' },
  bio:        { type: String, trim: true, default: '', maxlength: 500 },
  skills:     { type: [String], default: [] },
  // for supervisors: areas of interest
  interests:  { type: [String], default: [] },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.compare = function(pw) { return bcrypt.compare(pw, this.password); };

userSchema.methods.toPublic = function() {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model('User', userSchema);
