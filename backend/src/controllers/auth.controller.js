const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROLES = ['student', 'supervisor'];

function sign(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'devsecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

exports.register = async (req, res) => {
  const { fullName, email, password, role, department = '' } = req.body || {};
  if (!fullName || !email || !password || !role)
    return res.status(400).json({ message: 'fullName, email, password, role are required' });
  if (!ROLES.includes(role))
    return res.status(400).json({ message: `role must be one of: ${ROLES.join(', ')}` });
  if (String(password).length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ fullName, email, password, role, department });
  const token = sign(user);
  res.status(201).json({ token, user: user.toPublic() });
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  const ok = await user.compare(password);
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
  // Strict role validation: if the client selected a role at login, it must match the account's role.
  if (role && user.role !== role) {
    return res.status(403).json({
      message: `This account is registered as a ${user.role}. Please log in via the ${user.role} option.`,
    });
  }
  const token = sign(user);
  res.json({ token, user: user.toPublic() });
};

exports.me = async (req, res) => res.json({ user: req.user.toPublic() });

exports.updateMe = async (req, res) => {
  const allowed = ['fullName', 'department', 'bio', 'skills', 'interests'];
  for (const k of allowed) if (k in req.body) req.user[k] = req.body[k];
  await req.user.save();
  res.json({ user: req.user.toPublic() });
};

exports.changePassword = async (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next) return res.status(400).json({ message: 'current and next are required' });
  if (String(next).length < 6) return res.status(400).json({ message: 'New password must be at least 6 chars' });
  const u = await User.findById(req.user._id).select('+password');
  const ok = await u.compare(current);
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
  u.password = next;
  await u.save();
  res.json({ ok: true });
};
