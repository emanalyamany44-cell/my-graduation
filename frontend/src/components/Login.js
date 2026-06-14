import React, { useState } from 'react';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password, role); // role enforced server-side
      } else {
        if (!fullName.trim()) throw new Error('Full name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register({ fullName: fullName.trim(), email: email.trim(), password, role, department });
      }
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-softGray p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-navy p-3 rounded-full mb-3"><GraduationCap className="text-white" size={32} /></div>
          <h1 className="text-2xl font-bold text-navy">Graduation Project Hub</h1>
          <p className="text-gray-500 text-sm">{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {['student','supervisor'].map(r => (
            <button key={r} type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition ${role===r ? 'bg-white shadow text-navy' : 'text-gray-500'}`}>
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input className="input" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
              <input className="input" placeholder="Department (optional)" value={department} onChange={e=>setDepartment(e.target.value)} />
            </>
          )}
          <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />

          {err && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{err}</span>
            </div>
          )}

          <button disabled={busy} className="w-full bg-navy text-white rounded-lg py-3 font-semibold hover:bg-navy/90 disabled:opacity-50">
            {busy ? 'Please wait…' : (mode === 'login' ? `Sign in as ${role}` : `Create ${role} account`)}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }} className="text-navy font-semibold hover:underline">
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>

      <style>{`.input{width:100%;border:1px solid #d1d5db;border-radius:.6rem;padding:.65rem .8rem;outline:none}.input:focus{border-color:#0c1b3a}`}</style>
    </div>
  );
}
