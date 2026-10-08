import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (err.response?.data?.detail) {
    if (typeof err.response.data.detail === 'string') {
      return err.response.data.detail;
    }
    if (Array.isArray(err.response.data.detail)) {
      const msgs = err.response.data.detail
        .map((d) => d.msg || d.message || JSON.stringify(d))
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join('. ');
    }
    return JSON.stringify(err.response.data.detail);
  }
  if (typeof err.response?.data?.message === 'string') {
    return err.response.data.message;
  }
  if (err.response?.status === 502 || err.response?.status === 504) {
    return 'Backend server gateway timeout. Please ensure Uvicorn is running on port 8000.';
  }
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
    return 'Cannot connect to backend server. Please ensure the API server is running on http://127.0.0.1:8000.';
  }
  return fallback;
};

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('remember_me') === 'true';
    } catch {
      return true;
    }
  });
  const [usernameOrEmail, setUsernameOrEmail] = useState(() => {
    try {
      return localStorage.getItem('remembered_username') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registered = new URLSearchParams(location.search).get('registered') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanId = usernameOrEmail.trim();
    if (!cleanId) {
      setError('Please enter your username or email');
      return;
    }

    setLoading(true);

    try {
      await login(cleanId, password, rememberMe);
      try {
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('remembered_username', cleanId);
        } else {
          localStorage.removeItem('remember_me');
          localStorage.removeItem('remembered_username');
        }
      } catch (storageErr) {
        console.warn('Storage preference save error:', storageErr);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid username/email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to Robustness Lab</h2>
          <p className="text-xs text-slate-400">
            Access your models, perturbation experiments, and defense logs.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
          {registered && !error && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Account registered successfully! Please sign in with your credentials.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 pb-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
