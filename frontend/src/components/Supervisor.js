import React, { useEffect, useState, useCallback } from 'react';
import { Search, Send, GraduationCap, Mail } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Supervisor() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [sups, setSups] = useState([]);
  const [project, setProject] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [{ supervisors }, { project }] = await Promise.all([
        api.listSupervisors(q), api.myProject()
      ]);
      setSups(supervisors); setProject(project);
    } catch (e) { setErr(e.message); }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  if (user.role !== 'student') {
    return <div className="bg-white rounded-xl p-8 text-center text-gray-500">This page is for students. Use <b className="text-navy">Supervisor Dashboard</b>.</div>;
  }

  const isLeader = project && project.leader._id === user._id;
  const canRequest = isLeader && !project.supervisor;

  const sendReq = async (sid) => {
    if (!canRequest) return;
    try {
      await api.requestSupervisor(project._id, sid);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-navy">Find a Supervisor</h2>
        <p className="text-gray-500">Browse faculty and request supervision for your project.</p>
        {!isLeader && project && <p className="mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 text-sm">Only the team leader can send supervision requests.</p>}
        {!project && <p className="mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 text-sm">You need to be in a team first.</p>}
        {project?.supervisor && <p className="mt-2 text-green-700 bg-green-50 border border-green-200 rounded p-2 text-sm">Your project already has a supervisor: <b>{project.supervisor.fullName}</b>.</p>}
        {project?.supervisorStatus === 'pending' && <p className="mt-2 text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 text-sm">A supervision request is pending.</p>}
      </header>

      <div className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center bg-white border rounded-xl px-3 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input className="flex-1 px-3 py-2 outline-none" placeholder="Search by name, department, interests…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sups.map(s => (
          <div key={s._id} className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-navy/10 text-navy w-12 h-12 rounded-full flex items-center justify-center"><GraduationCap size={22}/></div>
              <div className="min-w-0">
                <p className="font-bold text-navy truncate">{s.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{s.department || 'Faculty'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2 truncate"><Mail size={12}/>{s.email}</p>
            {s.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {s.interests.slice(0,4).map(i => <span key={i} className="bg-softGray text-navy text-[10px] px-2 py-0.5 rounded">{i}</span>)}
              </div>
            )}
            <button
              disabled={!canRequest}
              onClick={() => sendReq(s._id)}
              className="w-full bg-navy text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={14}/> Request supervision
            </button>
          </div>
        ))}
        {sups.length === 0 && <p className="text-gray-500">No supervisors found.</p>}
      </div>
    </div>
  );
}
