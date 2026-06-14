import React, { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Download, File as FileIcon } from 'lucide-react';
import { api, fileUrl } from '../api';
import { useAuth } from '../AuthContext';

export default function ProjectFiles() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

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

  const loadFiles = async () => {
    if (!project) return;
    try { const { files } = await api.listFiles(project._id); setFiles(files); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { loadFiles(); }, [project]); // eslint-disable-line

  if (!project) return <div className="bg-white rounded-xl p-8 text-center text-gray-500">No project files yet — join or create a team first.</div>;

  const onUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { await api.uploadFile(project._id, file); await loadFiles(); }
    catch (e) { alert(e.message); }
    finally { setBusy(false); e.target.value = ''; }
  };
  const del = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try { await api.deleteFile(id); loadFiles(); } catch (e) { alert(e.message); }
  };

  const canUpload = user.role === 'student'; // supervisor: read-only

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-navy">Project Files</h2>
          <p className="text-gray-500">{project.title}</p>
        </div>
        {canUpload && (
          <>
            <input type="file" ref={inputRef} className="hidden" onChange={onUpload} />
            <button disabled={busy} onClick={()=>inputRef.current?.click()} className="bg-navy text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"><Upload size={16}/>{busy?'Uploading…':'Upload'}</button>
          </>
        )}
      </header>

      {err && <p className="text-red-600 mb-3">{err}</p>}

      <div className="bg-white rounded-xl shadow divide-y">
        {files.length === 0 && <p className="p-6 text-center text-gray-400">No files uploaded yet.</p>}
        {files.map(f => (
          <div key={f._id} className="flex items-center gap-3 p-4">
            <div className="bg-softGray text-navy w-10 h-10 rounded-lg flex items-center justify-center"><FileIcon size={18}/></div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{f.name}</p>
              <p className="text-xs text-gray-500">{(f.size/1024).toFixed(1)} KB · {f.folder} · {new Date(f.createdAt).toLocaleDateString()}</p>
            </div>
            <a href={fileUrl(f.url)} target="_blank" rel="noreferrer" className="p-2 text-navy hover:bg-softGray rounded-lg"><Download size={18}/></a>
            <button onClick={()=>del(f._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
