const User = require('../models/User');

exports.list = async (req, res) => {
  const { role, q = '' } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [
    { fullName: { $regex: q, $options: 'i' } },
    { email:    { $regex: q, $options: 'i' } },
    { department: { $regex: q, $options: 'i' } },
  ];
  const users = await User.find(filter).limit(100).sort({ fullName: 1 });
  res.json({ users: users.map(u => u.toPublic()) });
};

exports.getOne = async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: 'Not found' });
  res.json({ user: u.toPublic() });
};
