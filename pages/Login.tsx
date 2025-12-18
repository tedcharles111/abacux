import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

export const Login: React.FC<{ onLogin: (u: User) => void; onNavigate: (page: string) => void }> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('admin@abacusx.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h1>
        <p className="text-center text-slate-400 mb-8">Sign in to access your dashboard</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          {error && <p className="text-red-500 text-sm bg-red-900/10 p-2 rounded">{error}</p>}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="text-blue-400 hover:text-white font-semibold">
              Sign Up
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <div className="flex justify-between px-4">
             <span>User: user@abacusx.com</span>
             <span>Admin: admin@abacusx.com</span>
          </div>
          <p className="mt-1">Pass: password</p>
        </div>
      </div>
    </div>
  );
};