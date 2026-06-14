const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const FileDoc = require('../models/FileDoc');
const { helpers } = require('./project.controller');

function canAccess(project, user) {
  return helpers.isMember(project, user) ||
    (project.supervisor && project.supervisor.toString() === user._id.toString());
}

exports.list = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!canAccess(p, req.user)) return res.status(403).json({ message: 'Forbidden' });
  const files = await FileDoc.find({ project: p._id }).sort({ createdAt: -1 });
  res.json({ files });
};

exports.upload = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!helpers.isMember(p, req.user))
    return res.status(403).json({ message: 'Only team members can upload' });
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const f = await FileDoc.create({
    project: p._id,
    uploader: req.user._id,
    folder: req.body?.folder || 'General',
    name: req.file.originalname,
    storedName: req.file.filename,
    mime: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
  res.status(201).json({ file: f });
};

exports.remove = async (req, res) => {
  const f = await FileDoc.findById(req.params.id);
  if (!f) return res.status(404).json({ message: 'File not found' });
  const p = await Project.findById(f.project);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  const isUploader = f.uploader.toString() === req.user._id.toString();
  if (!isUploader && !helpers.isLeader(p, req.user))
    return res.status(403).json({ message: 'Only uploader or leader can delete' });
  const full = path.join(__dirname, '..', '..', 'uploads', f.storedName);
  if (fs.existsSync(full)) try { fs.unlinkSync(full); } catch {}
  await f.deleteOne();
  res.json({ ok: true });
};
