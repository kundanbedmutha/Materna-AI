import React, { useState } from 'react';
import './Login.css';

const USERS_KEY = 'materna_users';
const SESSION_KEY = 'materna_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function Blossom() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      {[0,60,120,180,240,300].map((deg, i) => (
        <ellipse key={i} cx="12" cy="7" rx="2.8" ry="5"
          fill="#C9706A" opacity={0.65 + (i % 3) * 0.1}
          transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3" fill="#FAF7F2" />
      <circle cx="12" cy="12" r="1.8" fill="#C9706A" opacity="0.9" />
    </svg>
  );
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = () => {
    setError('');
    if (!form.email || !form.password) { setError('Please enter email and password.'); return; }
    const users = getUsers();
    const user = users[form.email.toLowerCase()];
    if (!user) { setError('No account found. Please register first.'); return; }
    if (user.password !== form.password) { setError('Incorrect password.'); return; }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: form.email.toLowerCase(), ...user }));
      onLogin({ email: form.email.toLowerCase(), ...user });
    }, 500);
  };

  const handleRegister = () => {
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const users = getUsers();
    const key = form.email.toLowerCase();
    if (users[key]) { setError('An account with this email already exists.'); return; }
    const newUser = { name: form.name, password: form.password, week: null, age: 28, createdAt: new Date().toISOString() };
    users[key] = newUser;
    saveUsers(users);
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: key, ...newUser }));
      onLogin({ email: key, ...newUser });
    }, 500);
  };

  const handleKey = e => { if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister(); };

  return (
    <div className="login-bg">
      <div className="login-card" onKeyDown={handleKey}>
        <div className="login-logo">
          <Blossom />
          <h1 className="login-brand">MaternaAI</h1>
          <p className="login-tagline">Your pregnancy companion</p>
        </div>

        <div className="login-tabs">
          <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
          <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
        </div>

        <div className="login-fields">
          {mode === 'register' && (
            <div className="field-group">
              <label>Full name</label>
              <input type="text" placeholder="e.g. Priya Sharma" value={form.name}
                onChange={e => set('name', e.target.value)} autoFocus />
            </div>
          )}
          <div className="field-group">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)} autoFocus={mode === 'login'} />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className={`login-submit ${loading ? 'loading' : ''}`}
            onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <p className="login-disclaimer">
          MaternaAI provides general guidance only. Always consult your OB/midwife for clinical decisions.
        </p>
      </div>
    </div>
  );
}

export { SESSION_KEY };