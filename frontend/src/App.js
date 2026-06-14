import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { Menu, GraduationCap } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import MyTeam from './components/MyTeam';
import Supervisor from './components/Supervisor';
import SupervisorDashboard from './components/SupervisorDashboard';
import ProjectFiles from './components/ProjectFiles';
import Messages from './components/Messages';
import Settings from './components/Settings';
import Home from './components/Home';
import Login from './components/Login';
import NotificationBell from './components/Notifications';
import { useAuth } from './AuthContext';
import { api } from './api';

function App() {
  const { user, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    try { const { projects } = await api.listProjects(search); setProjects(projects); }
    catch (e) { setError(e.message); }
  }, [search]);

  useEffect(() => { if (user && user.role === 'student') loadProjects(); }, [user, loadProjects]);

  const handleJoin = async (projectId) => {
    try { await api.joinProject(projectId); await loadProjects(); }
    catch (e) { alert(e.message); }
  };

  const handleLogout = () => { logout(); setActivePage('home'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-softGray text-navy">Loading…</div>;
  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen bg-[#E5E7EB]">
      <Sidebar
        activePage={activePage} setActivePage={setActivePage}
        isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 w-full md:ml-72 flex flex-col min-h-screen">
        <div className="bg-white border-b px-4 md:px-10 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={26} className="text-navy"/></button>
            <span className="font-bold text-navy flex items-center gap-2"><GraduationCap size={20}/> Project Hub</span>
          </div>
          <div className="hidden md:block">
            <h2 className="font-semibold text-navy capitalize">{activePage === 'dashboard' ? 'Supervisor Dashboard' : activePage}</h2>
          </div>
          <NotificationBell />
        </div>

        <div className="p-4 md:p-10 flex-1 overflow-x-hidden">
          {activePage === 'home' && <Home goTo={setActivePage} />}

          {activePage === 'find' && user.role === 'student' && (
            <div>
              <header className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-navy">Find Your Team</h2>
                <p className="text-gray-500 font-medium">Browse open graduation projects</p>
              </header>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by project title…"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-1 shadow-sm outline-none focus:border-navy"/>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p) => (
                  <ProjectCard key={p._id}
                    title={p.title} leader={p.leader?.fullName || '—'}
                    current={p.currentMembers} max={p.maxMembers} skills={p.skills || []}
                    status={p.myRequestStatus === 'pending' ? 'sent' : undefined}
                    onJoin={() => handleJoin(p._id)} />
                ))}
                {projects.length === 0 && <p className="text-gray-500">No projects yet.</p>}
              </div>
            </div>
          )}

          {activePage === 'team'       && user.role === 'student'    && <MyTeam />}
          {activePage === 'supervisor' && user.role === 'student'    && <Supervisor />}
          {activePage === 'dashboard'  && user.role === 'supervisor' && <SupervisorDashboard goTo={setActivePage} />}
          {activePage === 'files'      && <ProjectFiles />}
          {activePage === 'messages'   && <Messages />}
          {activePage === 'settings'   && <Settings onLogout={handleLogout} />}
        </div>
      </main>
    </div>
  );
}

export default App;
