const Project = require('../models/Project');
const JoinRequest = require('../models/JoinRequest');
const SupervisionRequest = require('../models/SupervisionRequest');
const { notify } = require('../utils/notify');

function isLeader(project, user) {
  return project.leader.toString() === user._id.toString();
}
function isMember(project, user) {
  return isLeader(project, user) || project.members.some(m => m.toString() === user._id.toString());
}

exports.list = async (req, res) => {
  const { q = '' } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  const projects = await Project.find(filter)
    .populate('leader', 'fullName email department role')
    .populate('supervisor', 'fullName email department role')
    .sort({ createdAt: -1 })
    .limit(100);

  let myReqs = [];
  if (req.user) {
    myReqs = await JoinRequest.find({ student: req.user._id, status: 'pending' });
  }
  const reqByProject = new Map(myReqs.map(r => [r.project.toString(), r.status]));

  const out = projects.map(p => ({
    ...p.toObject(),
    myRequestStatus: reqByProject.get(p._id.toString()) || null,
  }));
  res.json({ projects: out });
};

exports.mine = async (req, res) => {
  const p = await Project.findOne({
    $or: [{ leader: req.user._id }, { members: req.user._id }],
  })
    .populate('leader', 'fullName email department role')
    .populate('members', 'fullName email department role')
    .populate('supervisor', 'fullName email department role');
  res.json({ project: p });
};

exports.getOne = async (req, res) => {
  const p = await Project.findById(req.params.id)
    .populate('leader', 'fullName email department role')
    .populate('members', 'fullName email department role')
    .populate('supervisor', 'fullName email department role');
  if (!p) return res.status(404).json({ message: 'Project not found' });
  res.json({ project: p });
};

exports.create = async (req, res) => {
  if (req.user.role !== 'student')
    return res.status(403).json({ message: 'Only students can create projects' });

  const existing = await Project.findOne({
    $or: [{ leader: req.user._id }, { members: req.user._id }],
  });
  if (existing) return res.status(409).json({ message: 'You already belong to a team' });

  const { title, description = '', skills = [], maxMembers = 4 } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });

  const project = await Project.create({
    title, description, skills, maxMembers,
    leader: req.user._id,
    members: [],
  });
  res.status(201).json({ project });
};

exports.update = async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!isLeader(p, req.user))
    return res.status(403).json({ message: 'Only the team leader can edit the project' });

  const allowed = ['title', 'description', 'skills', 'maxMembers', 'status'];
  for (const k of allowed) if (k in req.body) p[k] = req.body[k];

  // can't reduce maxMembers below current team size
  if (p.maxMembers < (p.members.length + 1))
    return res.status(400).json({ message: 'maxMembers cannot be less than current team size' });

  await p.save();

  // notify all members of the update
  for (const m of p.members) {
    await notify(m, {
      type: 'project_updated',
      title: 'Project updated',
      body: `"${p.title}" was updated by the team leader.`,
      meta: { projectId: p._id },
    });
  }
  if (p.supervisor) {
    await notify(p.supervisor, {
      type: 'project_updated',
      title: 'Supervised project updated',
      body: `"${p.title}" was updated by the team leader.`,
      meta: { projectId: p._id },
    });
  }
  res.json({ project: p });
};

exports.remove = async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Project not found' });
  if (!isLeader(p, req.user))
    return res.status(403).json({ message: 'Only the team leader can delete the project' });
  await JoinRequest.deleteMany({ project: p._id });
  await SupervisionRequest.deleteMany({ project: p._id });
  await p.deleteOne();
  res.json({ ok: true });
};

exports.helpers = { isLeader, isMember };
