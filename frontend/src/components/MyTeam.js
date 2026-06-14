import React, { useEffect, useState, useCallback } from 'react';
import { Users, UserPlus, UserMinus, Edit3, Crown, Save, X, Check, AlertCircle, GraduationCap } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function MyTeam() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // create-project form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);

  // edit modal
  const [editing, setEditing] = useState(false);
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eSkills, setESkills] = useState('');
  const [eMax, setEMax] = useState(4);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { project } = await api.myProject();
      setProject(project);
      if (project && project.leader._id === user._id) {
        const { requests } = await api.listJoinRequests(project._id);
        setRequests(requests.filter(r => r.status === 'pending'));
      } else {
        setRequests([]);
      }
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [user._id]);

  useEffect(() => { load(); }, [load]);

  if (user.role !== 'student') {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        Supervisors don't belong to a team. Go to <b className="text-navy">Supervisor Dashboard</b> instead.
      </div>
    );
  }

  if (loading) return <p className="text-gray-500">Loading…</p>;

  const isLeader = project && project.leader._id === user._id;

  const createProject = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api.createProject({
        title: title.trim(),
        description: description.trim(),
        skills: skills.split(',').map(s=>s.trim()).filter(Boolean),
        maxMembers: Number(maxMembers) || 4,
      });
      setTitle(''); setDescription(''); setSkills(''); setMaxMembers(4);
      load();
    } catch (e) { setErr(e.message); }
  };

  const respond = async (rid, decision) => {
    try { await api.respondJoinRequest(rid, decision); load(); }
    catch (e) { alert(e.message); }
  };
  const removeMember = async (uid) => {
    if (!window.confirm('Remove this member?')) return;
    try { await api.removeMember(project._id, uid); load(); }
    catch (e) { alert(e.message); }
  };
  const leave = async () => {
    if (!window.confirm('Leave this team?')) return;
    try { await api.leaveTeam(project._id); load(); }
    catch (e) { alert(e.message); }
  };
  const deleteProject = async () => {
    if (!window.confirm('Delete the whole project? This cannot be undone.')) return;
    try { await api.deleteProject(project._id); load(); }
    catch (e) { alert(e.message); }
  };

  const openEdit = () => {
    setETitle(project.title);
    setEDesc(project.description || '');
    setESkills((project.skills || []).join(', '));
    setEMax(project.maxMembers);
    setEditing(true);
  };
  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.updateProject(project._id, {
        title: eTitle.trim(),
        description: eDesc.trim(),
        skills: eSkills.split(',').map(s=>s.trim()).filter(Boolean),
        maxMembers: Number(eMax) || project.maxMembers,
      });
      setEditing(false); load();
    } catch (e) { alert(e.message); }
  };

  if (!project) {
    return (
      <div>
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-navy">My Team</h2>
          <p className="text-gray-500">You don't have a team yet. Create one as the team leader.</p>
        </header>
        <form onSubmit={createProject} className="bg-white rounded-xl shadow p-6 space-y-3 max-w-2xl">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Project title" value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Skills (comma separated)" value={skills} onChange={e=>setSkills(e.target.value)} />
          <input type="number" min="2" max="10" className="w-32 border rounded-lg px-3 py-2" value={maxMembers} onChange={e=>setMaxMembers(e.target.value)} />
          {err && <div className="text-red-600 text-sm flex gap-1 items-center"><AlertCircle size={14}/>{err}</div>}
          <button className="bg-navy text-white px-5 py-2 rounded-lg font-semibold">Create project</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-navy">{project.title}</h2>
          <p className="text-gray-500">{project.description || 'No description yet.'}</p>
        </div>
        <div className="flex gap-2">
          {isLeader && (
            <>
              <button onClick={openEdit} className="bg-white border px-4 py-2 rounded-lg font-semibold text-navy flex items-center gap-2"><Edit3 size={16}/>Edit</button>
              <button onClick={deleteProject} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-semibold">Delete</button>
            </>
          )}
          {!isLeader && (
            <button onClick={leave} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-semibold">Leave team</button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-navy mb-3 flex items-center gap-2"><Users size={18}/> Members ({project.members.length + 1}/{project.maxMembers})</h3>
            <ul className="divide-y">
              <li className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy flex items-center gap-2">{project.leader.fullName} <Crown size={14} className="text-gold"/></p>
                  <p className="text-xs text-gray-500">{project.leader.email} · Leader</p>
                </div>
              </li>
              {project.members.map(m => (
                <li key={m._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy">{m.fullName}</p>
                    <p className="text-xs text-gray-500">{m.email} · Member</p>
                  </div>
                  {isLeader && (
                    <button onClick={() => removeMember(m._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="Remove">
                      <UserMinus size={18}/>
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {project.skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.skills.map(s => <span key={s} className="bg-softGray text-navy text-xs px-2 py-1 rounded">{s}</span>)}
              </div>
            )}
          </div>

          {isLeader && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-navy mb-3 flex items-center gap-2"><UserPlus size={18}/> Pending join requests</h3>
              {requests.length === 0 && <p className="text-sm text-gray-400">No pending requests.</p>}
              <ul className="divide-y">
                {requests.map(r => (
                  <li key={r._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{r.student?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{r.student?.email} · {r.student?.department}</p>
                      {r.message && <p className="text-xs text-gray-600 italic mt-1">"{r.message}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>respond(r._id,'accept')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Check size={14}/>Accept</button>
                      <button onClick={()=>respond(r._id,'reject')} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><X size={14}/>Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-navy mb-2 flex items-center gap-2"><GraduationCap size={18}/> Supervisor</h3>
            {project.supervisor ? (
              <>
                <p className="font-semibold text-navy">{project.supervisor.fullName}</p>
                <p className="text-xs text-gray-500">{project.supervisor.email} · {project.supervisor.department}</p>
                <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Accepted</span>
              </>
            ) : project.supervisorStatus === 'pending' ? (
              <p className="text-sm"><span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded">Request pending</span></p>
            ) : project.supervisorStatus === 'rejected' ? (
              <p className="text-sm"><span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Last request rejected</span> — try another supervisor.</p>
            ) : (
              <p className="text-sm text-gray-500">No supervisor yet. Go to <b>Supervisor</b> tab to send a request.</p>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={saveEdit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-navy text-lg">Edit project</h3>
              <button type="button" onClick={()=>setEditing(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18}/></button>
            </div>
            <input className="w-full border rounded-lg px-3 py-2" value={eTitle} onChange={e=>setETitle(e.target.value)} required />
            <textarea rows={4} className="w-full border rounded-lg px-3 py-2" placeholder="Description" value={eDesc} onChange={e=>setEDesc(e.target.value)} />
            <input className="w-full border rounded-lg px-3 py-2" placeholder="Skills (comma separated)" value={eSkills} onChange={e=>setESkills(e.target.value)} />
            <label className="block text-sm text-gray-500">Max members
              <input type="number" min="2" max="10" className="w-full border rounded-lg px-3 py-2 mt-1" value={eMax} onChange={e=>setEMax(e.target.value)} />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={()=>setEditing(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button className="bg-navy text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"><Save size={16}/>Save changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
