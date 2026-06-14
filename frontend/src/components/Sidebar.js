import React from 'react';
import { Home, Search, Users, GraduationCap, FileText, MessageSquare, Settings as SettingsIcon, LayoutDashboard, X, GraduationCap as Hat } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  const { user } = useAuth();
  const isSup = user?.role === 'supervisor';

  const items = isSup ? [
    { id: 'home',       name: 'Home',                 icon: <Home size={20}/> },
    { id: 'dashboard',  name: 'Supervisor Dashboard', icon: <LayoutDashboard size={20}/> },
    { id: 'files',      name: 'Project Files',        icon: <FileText size={20}/> },
    { id: 'messages',   name: 'Messages',             icon: <MessageSquare size={20}/> },
    { id: 'settings',   name: 'Settings',             icon: <SettingsIcon size={20}/> },
  ] : [
    { id: 'home',       name: 'Home',          icon: <Home size={20}/> },
    { id: 'find',       name: 'Find a Team',   icon: <Search size={20}/> },
    { id: 'team',       name: 'My Team',       icon: <Users size={20}/> },
    { id: 'supervisor', name: 'Supervisor',    icon: <GraduationCap size={20}/> },
    { id: 'files',      name: 'Project Files', icon: <FileText size={20}/> },
    { id: 'messages',   name: 'Messages',      icon: <MessageSquare size={20}/> },
    { id: 'settings',   name: 'Settings',      icon: <SettingsIcon size={20}/> },
  ];

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={()=>setIsMobileOpen(false)} />}
      <div className={`w-72 h-screen bg-navy text-white flex flex-col fixed left-0 top-0 shadow-xl z-50 transition-transform duration-300 ${isMobileOpen?'translate-x-0':'-translate-x-full'} md:translate-x-0`}>
        <button className="md:hidden absolute top-6 right-6 text-white" onClick={()=>setIsMobileOpen(false)}><X size={26}/></button>
        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-3 rounded-full mb-3 shadow-lg"><Hat className="text-navy" size={32}/></div>
          <h1 className="text-center font-bold text-xl">Project Hub</h1>
          <p className="text-xs text-white/60 capitalize mt-1">{user?.role}</p>
        </div>
        <nav className="flex-1 mt-2">
          {items.map(it => (
            <div key={it.id} onClick={()=>{ setActivePage(it.id); setIsMobileOpen(false); }}
              className={`flex items-center gap-4 px-8 py-3 cursor-pointer transition-all ${
                activePage===it.id?'bg-softGray text-navy rounded-l-full ml-4 font-bold shadow-inner':'hover:bg-white/10 text-gray-300'
              }`}>
              {it.icon}<span>{it.name}</span>
            </div>
          ))}
        </nav>
        <div className="px-8 py-4 border-t border-white/10 text-xs text-white/70">
          <p className="font-bold text-white truncate">{user?.fullName}</p>
          <p className="truncate">{user?.email}</p>
        </div>
      </div>
    </>
  );
}
