const Notification = require('../models/Notification');

async function notify(user, payload) {
  if (!user) return null;
  try {
    return await Notification.create({ user, ...payload });
  } catch (e) {
    console.error('notify failed:', e.message);
    return null;
  }
}

module.exports = { notify };
