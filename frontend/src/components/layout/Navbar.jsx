import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Play, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ onRunDemo, isDemoRunning }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              AI Robustness <span className="text-cyan-400 font-extrabold">Defence Lab</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-mono">
              Malware & IDS Hardening
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <button
              onClick={onRunDemo}
              disabled={isDemoRunning}
              className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isDemoRunning ? 'animate-spin' : ''}`} />
              <span>{isDemoRunning ? 'Running Demo...' : 'Run Demo Experiment'}</span>
            </button>

            <div className="h-5 w-px bg-slate-800" />

            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-semibold">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline font-medium text-slate-200">{user?.full_name || user?.username}</span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
