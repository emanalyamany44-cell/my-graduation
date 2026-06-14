import React, { useEffect, useState, useCallback } from 'react';
import { GraduationCap, Check, X, Users, FolderOpen, MessageSquare } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function SupervisorDashboard({ goTo }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [{ requests }, { projects }] = await Promise.all([
        api.mySupervisionRequests(), api.mySupervisedProjects(),
      ]);
      setRequests(requests); setProjects(projects);
    } catch (e) { setErr(e.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (user.role !== 'supervisor') {
    return <div className="bg-white rounded-xl p-8 text-center text-gray-500">This dashboard is for supervisors only.</div>;
  }

  const respond = async (id, decision) => {
    try { await api.respondSupervision(id, decision); load(); }
    catch (e) { alert(e.message); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const history = requests.filter(r => r.status !== 'pending');

  return (
    <div>
      <header className="mb-6 flex items-center gap-3">
        <div className="bg-navy text-white w-12 h-12 rounded-xl flex items-center justify-center"><GraduationCap size={24}/></div>
        <div>
          <h2 className="text-3xl font-bold text-navy">Supervisor Dashboard</h2>
          <p className="text-gray-500">Manage supervision requests and your supervised projects.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Pending requests" value={pending.length} color="bg-amber-100 text-amber-700" />
        <Stat label="Supervised projects" value={projects.length} color="bg-green-100 text-green-700" />
        <Stat label="Total requests" value={requests.length} color="bg-blue-100 text-blue-700" />
      </div>

      <div className="flex gap-2 mb-4 border-b">
        {[['pending','Pending'],['projects','My projects'],['history','History']].map(([k,l]) => (
          <button key={k} onClick={()=>setTab(k)} className={`px-4 py-2 -mb-px border-b-2 ${tab===k?'border-navy text-navy font-semibold':'border-transparent text-gray-500'}`}>{l}</button>
        ))}
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-gray-500 bg-white rounded-xl p-6 text-center">No pending requests.</p>}
          {pending.map(r => (
            <div key={r._id} className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy">{r.project?.title}</p>
                <p className="text-sm text-gray-600">by {r.project?.leader?.fullName} · {r.project?.leader?.department}</p>
                {r.message && <p className="text-xs text-gray-500 italic mt-1">"{r.message}"</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>respond(r._id,'accept')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1"><Check size={16}/>Accept</button>
                <button onClick={()=>respond(r._id,'reject')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-1"><X size={16}/>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 && <p className="text-gray-500 bg-white rounded-xl p-6 text-center md:col-span-2">No supervised projects yet.</p>}
          {projects.map(p => (
            <div key={p._id} className="bg-white rounded-xl shadow p-5">
              <p className="font-bold text-navy text-lg">{p.title}</p>
              <p className="text-sm text-gray-600 mb-2">{p.description || 'No description.'}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-2"><Users size={12}/> {p.members.length + 1}/{p.maxMembers} members · led by {p.leader.fullName}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>goTo?.('files')} className="text-xs bg-softGray text-navy px-3 py-1.5 rounded-lg flex items-center gap-1"><FolderOpen size={12}/>Files</button>
                <button onClick={()=>goTo?.('messages')} className="text-xs bg-softGray text-navy px-3 py-1.5 rounded-lg flex items-center gap-1"><MessageSquare size={12}/>Messages</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 && <p className="text-gray-500 bg-white rounded-xl p-6 text-center">No history.</p>}
          {history.map(r => (
            <div key={r._id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">{r.project?.title}</p>
                <p className="text-xs text-gray-500">{new Date(r.updatedAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                r.status==='accepted'?'bg-green-100 text-green-700':
                r.status==='rejected'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-600'
              }`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color.split(' ')[1]}`}>{value}</p>
    </div>
  );
}
