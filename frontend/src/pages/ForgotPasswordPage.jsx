import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Shield, Lock, User, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

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

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your username or registered email');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email_or_username: cleanIdentifier,
        new_password: newPassword,
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset Account Password</h2>
          <p className="text-xs text-slate-400">
            Development password recovery workflow.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Username or Registered Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. researcher"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">New Password (Min. 8 characters)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
