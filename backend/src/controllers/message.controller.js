const Project = require('../models/Project');
const Message = require('../models/Message');
const { helpers } = require('./project.controller');

function canAccess(project, user) {
  return helpers.isMember(project, user) ||
    (project.supervisor && project.supervisor.toString() === user._id.toString());
}

exports.list = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!canAccess(p, req.user)) return res.status(403).json({ message: 'Forbidden' });
  const msgs = await Message.find({ project: p._id })
    .populate('author', 'fullName role')
    .sort({ createdAt: 1 })
    .limit(500);
  res.json({ messages: msgs });
};

exports.send = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!canAccess(p, req.user)) return res.status(403).json({ message: 'Forbidden' });
  const { body } = req.body || {};
  if (!body || !String(body).trim()) return res.status(400).json({ message: 'body is required' });
  const m = await Message.create({ project: p._id, author: req.user._id, body: String(body).trim() });
  const populated = await m.populate('author', 'fullName role');
  res.status(201).json({ message: populated });
};
