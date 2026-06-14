const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notifications: items, unread });
};

exports.markRead = async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }, { new: true }
  );
  if (!n) return res.status(404).json({ message: 'Not found' });
  res.json({ notification: n });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
};
