import React, { useEffect, useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const endRef = useRef(null);

  const loadProject = async () => {
    try {
      if (user.role === 'supervisor') {
        const { projects } = await api.mySupervisedProjects();
        setProject(projects[0] || null);
      } else {
        const { project } = await api.myProject();
        setProject(project);
      }
    } catch (e) { setErr(e.message); }
  };

  useEffect(() => { loadProject(); }, []); // eslint-disable-line

  useEffect(() => {
    if (!project) return;
    const load = async () => {
      try { const { messages } = await api.projectMessages(project._id); setMessages(messages); }
      catch (e) { setErr(e.message); }
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [project]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!project) return <div className="bg-white rounded-xl p-8 text-center text-gray-500">No team conversation available yet.</div>;

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      const { message } = await api.sendProjectMessage(project._id, body.trim());
      setMessages(m => [...m, message]); setBody('');
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow h-[calc(100vh-9rem)] overflow-hidden">
      <header className="px-5 py-4 border-b">
        <h3 className="font-bold text-navy">{project.title}</h3>
        <p className="text-xs text-gray-500">Team chat</p>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-softGray/40">
        {messages.map(m => {
          const mine = m.author?._id === user._id;
          return (
            <div key={m._id} className={`flex ${mine?'justify-end':'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${mine?'bg-navy text-white':'bg-white border'} shadow-sm`}>
                {!mine && <p className="text-[10px] font-bold opacity-70 mb-0.5">{m.author?.fullName} · {m.author?.role}</p>}
                <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                <p className="text-[10px] opacity-60 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="text-center text-gray-400 text-sm">No messages yet. Say hi!</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <input className="flex-1 border rounded-full px-4 py-2 outline-none focus:border-navy" placeholder="Type a message…" value={body} onChange={e=>setBody(e.target.value)} />
        <button className="bg-navy text-white rounded-full w-11 h-11 flex items-center justify-center"><Send size={18}/></button>
      </form>
      {err && <p className="text-red-600 text-xs px-3 pb-2">{err}</p>}
    </div>
  );
}
