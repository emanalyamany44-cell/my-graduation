const User = require('../models/User');
const Project = require('../models/Project');
const SupervisionRequest = require('../models/SupervisionRequest');
const { notify } = require('../utils/notify');
const { helpers } = require('./project.controller');

exports.list = async (req, res) => {
  const { q = '' } = req.query;
  const filter = { role: 'supervisor' };
  if (q) filter.$or = [
    { fullName: { $regex: q, $options: 'i' } },
    { department: { $regex: q, $options: 'i' } },
    { interests: { $regex: q, $options: 'i' } },
  ];
  const supervisors = await User.find(filter).sort({ fullName: 1 });
  res.json({ supervisors: supervisors.map(u => u.toPublic()) });
};

exports.requestSupervision = async (req, res) => {
  const { projectId, supervisorId, message = '' } = req.body || {};
  if (!projectId || !supervisorId)
    return res.status(400).json({ message: 'projectId and supervisorId are required' });

  const p = await Project.findById(projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!helpers.isLeader(p, req.user))
    return res.status(403).json({ message: 'Only the team leader can request a supervisor' });
  if (p.supervisor) return res.status(409).json({ message: 'Project already has a supervisor' });

  // STRICT role check: target must actually be a supervisor account
  const sup = await User.findById(supervisorId);
  if (!sup) return res.status(404).json({ message: 'Supervisor not found' });
  if (sup.role !== 'supervisor')
    return res.status(400).json({ message: 'Selected user is not a supervisor' });

  const existing = await SupervisionRequest.findOne({ project: p._id, supervisor: sup._id, status: 'pending' });
  if (existing) return res.status(409).json({ message: 'A pending request already exists' });

  const r = await SupervisionRequest.create({
    project: p._id, supervisor: sup._id, requestedBy: req.user._id, message,
  });
  p.supervisorStatus = 'pending';
  await p.save();

  await notify(sup._id, {
    type: 'supervision_request',
    title: 'New supervision request',
    body: `Team "${p.title}" requested you as supervisor.`,
    meta: { projectId: p._id, requestId: r._id },
  });
  res.status(201).json({ request: r });
};

// Supervisor: list pending requests addressed to me
exports.myRequests = async (req, res) => {
  if (req.user.role !== 'supervisor')
    return res.status(403).json({ message: 'Supervisors only' });
  const reqs = await SupervisionRequest.find({ supervisor: req.user._id })
    .populate({
      path: 'project',
      populate: { path: 'leader', select: 'fullName email department' },
    })
    .populate('requestedBy', 'fullName email')
    .sort({ createdAt: -1 });
  res.json({ requests: reqs });
};

// Supervisor: respond
exports.respond = async (req, res) => {
  if (req.user.role !== 'supervisor')
    return res.status(403).json({ message: 'Supervisors only' });
  const { decision } = req.body || {};
  if (!['accept', 'reject'].includes(decision))
    return res.status(400).json({ message: 'decision must be accept or reject' });

  const r = await SupervisionRequest.findById(req.params.requestId);
  if (!r) return res.status(404).json({ message: 'Request not found' });
  if (r.supervisor.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your request' });
  if (r.status !== 'pending') return res.status(409).json({ message: `Already ${r.status}` });

  const p = await Project.findById(r.project);
  if (!p) return res.status(404).json({ message: 'Project no longer exists' });

  if (decision === 'accept') {
    if (p.supervisor) {
      r.status = 'rejected';
      await r.save();
      return res.status(409).json({ message: 'Project already has a supervisor' });
    }
    p.supervisor = req.user._id;
    p.supervisorStatus = 'accepted';
    await p.save();
    r.status = 'accepted';
    await r.save();
    // auto-cancel other pending supervision requests for this project
    await SupervisionRequest.updateMany(
      { project: p._id, status: 'pending', _id: { $ne: r._id } },
      { status: 'cancelled' }
    );
    await notify(p.leader, {
      type: 'supervision_accepted',
      title: 'Supervisor accepted',
      body: `${req.user.fullName} accepted to supervise "${p.title}".`,
      meta: { projectId: p._id },
    });
  } else {
    r.status = 'rejected';
    p.supervisorStatus = 'rejected';
    await p.save();
    await r.save();
    await notify(p.leader, {
      type: 'supervision_rejected',
      title: 'Supervision rejected',
      body: `${req.user.fullName} declined supervising "${p.title}".`,
      meta: { projectId: p._id },
    });
  }
  res.json({ request: r });
};

// Supervisor: list projects I supervise
exports.myProjects = async (req, res) => {
  if (req.user.role !== 'supervisor')
    return res.status(403).json({ message: 'Supervisors only' });
  const projects = await Project.find({ supervisor: req.user._id })
    .populate('leader', 'fullName email department')
    .populate('members', 'fullName email department')
    .sort({ createdAt: -1 });
  res.json({ projects });
};
