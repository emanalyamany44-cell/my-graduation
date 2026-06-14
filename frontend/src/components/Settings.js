import React, { useState } from 'react';
import { User, Bell, Lock, LogOut } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const Settings = ({ onLogout }) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ fullName: user.fullName, major: user.major || '', department: user.department || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');

  const save = async () => {
    try { const { user: u } = await api.updateMe(form); setUser(u); setMsg('Profile saved'); }
    catch (e) { alert(e.message); }
  };

  const changePwd = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) return alert('Fill both passwords');
    try { await api.changePassword(pwd); setPwd({ currentPassword: '', newPassword: '' }); alert('Password changed'); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <header className="mb-8">
        <h2 className="text-4xl font-bold text-navy">Settings</h2>
        <p className="text-gray-500 font-medium mt-1">Manage your account preferences and profile</p>
      </header>

      <div className="flex flex-col gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <User className="text-navy" size={24} />
            <h3 className="text-xl font-bold text-navy">Profile Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
            <Input label="Email" value={user.email} disabled />
            {user.role === 'student' ? (
              <>
                <Input label="Student ID" value={user.studentId || ''} disabled />
                <Input label="Major" value={form.major} onChange={(v) => setForm({ ...form, major: v })} />
              </>
            ) : (
              <Input label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
            )}
          </div>
          {msg && <p className="text-green-600 text-sm mt-4">{msg}</p>}
          <div className="mt-6 flex justify-end">
            <button onClick={save} className="bg-navy text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition">Save Changes</button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <Lock className="text-navy" size={24} />
            <h3 className="text-xl font-bold text-navy">Change Password</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current password" type="password" value={pwd.currentPassword} onChange={(v) => setPwd({ ...pwd, currentPassword: v })} />
            <Input label="New password" type="password" value={pwd.newPassword} onChange={(v) => setPwd({ ...pwd, newPassword: v })} />
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={changePwd} className="bg-navy text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition">Update Password</button>
          </div>
        </div>

        <button onClick={onLogout} className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-center justify-center gap-3 text-red-600 font-bold hover:bg-red-100 transition">
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = 'text', disabled }) => (
  <div>
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
    <input
      type={type} value={value} disabled={disabled}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={`w-full ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-softGray'} border border-gray-200 rounded-lg py-2 px-4 outline-none focus:border-navy text-navy font-medium`}
    />
  </div>
);

export default Settings;
