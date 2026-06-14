import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, UserPlus, UserCheck, UserX, GraduationCap, Edit3, MessageCircle, X } from 'lucide-react';
import { api } from '../api';

const ICONS = {
  join_request:         { icon: UserPlus,  color: 'bg-blue-100 text-blue-600' },
  join_accepted:        { icon: UserCheck, color: 'bg-green-100 text-green-600' },
  join_rejected:        { icon: UserX,     color: 'bg-red-100 text-red-600' },
  supervision_request:  { icon: GraduationCap, color: 'bg-amber-100 text-amber-600' },
  supervision_accepted: { icon: UserCheck, color: 'bg-green-100 text-green-600' },
  supervision_rejected: { icon: UserX,     color: 'bg-red-100 text-red-600' },
  project_updated:      { icon: Edit3,     color: 'bg-indigo-100 text-indigo-600' },
  member_removed:       { icon: UserX,     color: 'bg-red-100 text-red-600' },
  message:              { icon: MessageCircle, color: 'bg-gray-100 text-gray-600' },
};

function relative(ts) {
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { notifications, unread } = await api.listNotifications();
      setItems(notifications); setUnread(unread);
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const markAll = async () => { await api.markAllNotificationsRead(); load(); };
  const markOne = async (id) => { await api.markNotificationRead(id); load(); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v=>!v)} className="relative p-2 rounded-full hover:bg-gray-100 text-navy">
        <Bell size={22} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[92vw] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-bold text-navy">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAll} className="text-xs text-navy hover:underline flex items-center gap-1">
                  <CheckCheck size={14}/> Mark all read
                </button>
              )}
              <button onClick={()=>setOpen(false)} className="p-1 rounded hover:bg-gray-100"><X size={16}/></button>
            </div>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">You have no notifications</div>}
            {items.map(n => {
              const meta = ICONS[n.type] || ICONS.message;
              const Icon = meta.icon;
              return (
                <div key={n._id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${meta.color}`}>
                    <Icon size={16}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                    <p className="text-xs text-gray-600 break-words">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{relative(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button onClick={()=>markOne(n._id)} className="self-start text-gray-400 hover:text-navy" title="Mark read">
                      <Check size={16}/>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
