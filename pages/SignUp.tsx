
import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Shield } from 'lucide-react';

export const SignUp: React.FC<{ onLogin: (u: User) => void; onNavigate: (page: string) => void }> = ({ onLogin, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 8) {
        setError('Password must be at least 8 characters for institutional compliance');
        setLoading(false);
        return;
    }

    try {
      const user = await api.register(name, email, password);
      onLogin(user); // Auto login after signup
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Create Account</h1>
        <p className="text-center text-slate-400 mb-8">Join the AbacusX institutional network</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="text" 
              placeholder="John Doe"
              required
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="email" 
              placeholder="you@example.com"
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="password" 
              placeholder="••••••••"
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded-lg flex items-start">
             <Shield size={16} className="text-blue-400 mr-2 shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-300 leading-relaxed">
               Administrative roles are restricted to whitelisted institutional emails. 
               All other accounts default to Standard User status.
             </p>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-900/10 p-2 rounded">{error}</p>}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')} className="text-blue-400 hover:text-white font-semibold">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
