import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import { api } from './services/api';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AdminUserDetail } from './pages/admin/AdminUserDetail';

// Mock components for less critical pages to save space
const PlaceholderPage: React.FC<{title: string}> = ({title}) => (
  <div className="text-white p-8 border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center min-h-[400px]">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-slate-400 mb-6">This module is part of the full implementation.</p>
    <div className="flex space-x-4">
      <button className="px-4 py-2 bg-slate-800 rounded text-sm hover:bg-slate-700">View Spec</button>
      <button className="px-4 py-2 bg-slate-800 rounded text-sm hover:bg-slate-700">Mock Action</button>
    </div>
  </div>
);

// Simple Login Page
const Login: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@abacusx.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid credentials. Try admin@abacusx.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800">
        <h1 className="text-3xl font-bold text-center text-white mb-2">AbacusX</h1>
        <p className="text-center text-slate-400 mb-8">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Demo Credentials:</p>
          <p>User: user@abacusx.com</p>
          <p>Admin: admin@abacusx.com</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('dashboard');
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);

  // Simple Router Logic
  const navigate = (p: string) => {
    setPage(p);
    // Reset admin selection if navigating away
    if (!p.startsWith('admin_user_detail')) {
      setAdminSelectedUserId(null);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={navigate} />;
      case 'wallet':
        return <PlaceholderPage title="Wallet & Deposits" />;
      case 'invest':
        return <PlaceholderPage title="Investment Plans" />;
      case 'kyc':
        return <PlaceholderPage title="Identity Verification" />;
      
      // Admin Routes
      case 'admin_dashboard':
         return (
           <div className="space-y-6">
             <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-slate-400 text-sm">Total Assets</h3>
                  <p className="text-2xl font-bold text-white mt-2">$2.4M</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-slate-400 text-sm">Active Users</h3>
                  <p className="text-2xl font-bold text-white mt-2">1,245</p>
                </div>
             </div>
           </div>
         );
      case 'admin_users':
        // Inline Admin User List
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 uppercase text-xs font-semibold text-slate-500">
                   <tr>
                     <th className="px-6 py-4">Name</th>
                     <th className="px-6 py-4">Role</th>
                     <th className="px-6 py-4">Balance (Est)</th>
                     <th className="px-6 py-4">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  <tr className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">Alex Trader (Demo User)</td>
                    <td className="px-6 py-4"><span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded text-xs">USER</span></td>
                    <td className="px-6 py-4">$45,231</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { setAdminSelectedUserId('u1'); setPage('admin_user_detail'); }}
                        className="text-blue-400 hover:text-white"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">Sarah Smith</td>
                    <td className="px-6 py-4"><span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded text-xs">USER</span></td>
                    <td className="px-6 py-4">$0.00</td>
                    <td className="px-6 py-4">
                       <button 
                        onClick={() => { setAdminSelectedUserId('u2'); setPage('admin_user_detail'); }}
                        className="text-blue-400 hover:text-white"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'admin_user_detail':
        return adminSelectedUserId ? (
          <AdminUserDetail userId={adminSelectedUserId} onBack={() => navigate('admin_users')} />
        ) : (
          <div>Error: No user selected</div>
        );
      default:
        return <Dashboard user={user} onNavigate={navigate} />;
    }
  };

  return (
    <Layout user={user} onLogout={() => setUser(null)} currentPage={page} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  );
}