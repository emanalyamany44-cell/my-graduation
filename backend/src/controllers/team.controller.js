const Project = require('../models/Project');
const JoinRequest = require('../models/JoinRequest');
const { notify } = require('../utils/notify');
const { helpers } = require('./project.controller');

exports.requestJoin = async (req, res) => {
  if (req.user.role !== 'student')
    return res.status(403).json({ message: 'Only students can join teams' });

  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });

  if (helpers.isMember(p, req.user))
    return res.status(409).json({ message: 'You are already in this team' });

  // user must not be on any other team
  const otherTeam = await Project.findOne({
    $or: [{ leader: req.user._id }, { members: req.user._id }],
  });
  if (otherTeam) return res.status(409).json({ message: 'You already belong to a team' });

  if (p.currentMembers >= p.maxMembers)
    return res.status(409).json({ message: 'Team is full' });

  const existing = await JoinRequest.findOne({ project: p._id, student: req.user._id, status: 'pending' });
  if (existing) return res.status(409).json({ message: 'Request already pending' });

  const r = await JoinRequest.create({
    project: p._id, student: req.user._id, message: req.body?.message || '',
  });
  await notify(p.leader, {
    type: 'join_request',
    title: 'New join request',
    body: `${req.user.fullName} requested to join "${p.title}".`,
    meta: { projectId: p._id, requestId: r._id },
  });
  res.status(201).json({ request: r });
};

exports.cancelJoin = async (req, res) => {
  const r = await JoinRequest.findOneAndUpdate(
    { project: req.params.projectId, student: req.user._id, status: 'pending' },
    { status: 'cancelled' }, { new: true }
  );
  if (!r) return res.status(404).json({ message: 'No pending request' });
  res.json({ ok: true });
};

exports.listRequests = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!helpers.isLeader(p, req.user))
    return res.status(403).json({ message: 'Only the team leader can view requests' });
  const reqs = await JoinRequest.find({ project: p._id })
    .populate('student', 'fullName email department skills')
    .sort({ createdAt: -1 });
  res.json({ requests: reqs });
};

exports.respondRequest = async (req, res) => {
  const { decision } = req.body || {};
  if (!['accept', 'reject'].includes(decision))
    return res.status(400).json({ message: 'decision must be accept or reject' });

  const r = await JoinRequest.findById(req.params.requestId).populate('project');
  if (!r) return res.status(404).json({ message: 'Request not found' });
  if (r.status !== 'pending') return res.status(409).json({ message: `Already ${r.status}` });

  const p = await Project.findById(r.project._id);
  if (!helpers.isLeader(p, req.user))
    return res.status(403).json({ message: 'Only the team leader can respond' });

  if (decision === 'accept') {
    if (p.currentMembers >= p.maxMembers)
      return res.status(409).json({ message: 'Team is full' });
    // ensure student isn't already on another team
    const otherTeam = await Project.findOne({
      _id: { $ne: p._id },
      $or: [{ leader: r.student }, { members: r.student }],
    });
    if (otherTeam) {
      r.status = 'rejected';
      await r.save();
      return res.status(409).json({ message: 'Student joined another team meanwhile' });
    }
    p.members.push(r.student);
    await p.save();
    r.status = 'accepted';
    await r.save();
    await notify(r.student, {
      type: 'join_accepted',
      title: 'Request accepted',
      body: `You joined "${p.title}".`,
      meta: { projectId: p._id },
    });
    // auto-reject this student's other pending requests
    await JoinRequest.updateMany(
      { student: r.student, status: 'pending', _id: { $ne: r._id } },
      { status: 'cancelled' }
    );
  } else {
    r.status = 'rejected';
    await r.save();
    await notify(r.student, {
      type: 'join_rejected',
      title: 'Request rejected',
      body: `Your request to join "${p.title}" was rejected.`,
      meta: { projectId: p._id },
    });
  }
  res.json({ request: r });
};

exports.removeMember = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!helpers.isLeader(p, req.user))
    return res.status(403).json({ message: 'Only the team leader can remove members' });
  if (req.params.userId === p.leader.toString())
    return res.status(400).json({ message: 'Cannot remove the team leader' });
  const before = p.members.length;
  p.members = p.members.filter(m => m.toString() !== req.params.userId);
  if (p.members.length === before) return res.status(404).json({ message: 'Not a member' });
  await p.save();
  await notify(req.params.userId, {
    type: 'member_removed',
    title: 'Removed from team',
    body: `You were removed from "${p.title}".`,
    meta: { projectId: p._id },
  });
  res.json({ project: p });
};

exports.leave = async (req, res) => {
  const p = await Project.findById(req.params.projectId);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (helpers.isLeader(p, req.user))
    return res.status(400).json({ message: 'Team leader cannot leave; delete the project instead' });
  const before = p.members.length;
  p.members = p.members.filter(m => m.toString() !== req.user._id.toString());
  if (p.members.length === before) return res.status(400).json({ message: 'You are not in this team' });
  await p.save();
  await notify(p.leader, {
    type: 'member_removed',
    title: 'Member left team',
    body: `${req.user.fullName} left "${p.title}".`,
    meta: { projectId: p._id },
  });
  res.json({ ok: true });
};
