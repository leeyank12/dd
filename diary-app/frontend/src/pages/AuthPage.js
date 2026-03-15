import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

//const API = 'http://localhost:5000/api/auth';
const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth`;
export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
 const API = 'http://localhost:5000/api/auth';
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch(`${API}/${mode}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password }
      ),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    login(data);
    toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
    navigate('/');
  } catch (err) {
    toast.error(err.message);
    console.error('Auth error:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8f7f4', padding: 20,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body" style={{ padding: 36 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40 }}>📔</div>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 26, fontWeight: 700, margin: '8px 0 4px',
            }}>
              Dear Diary
            </h1>
            <p style={{ color: '#6b6860', fontSize: 14 }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: '#f0ede8',
            borderRadius: 10, padding: 4, marginBottom: 24,
          }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1a1916' : '#6b6860',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}