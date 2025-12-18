import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { User } from './types';

// Pages - Authenticated
import { Dashboard } from './pages/Dashboard';
import { AdminUserDetail } from './pages/admin/AdminUserDetail';

// Pages - Public
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Support } from './pages/Support';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

// Mock components for less critical pages
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // Public Page State ('home', 'about', 'support', 'login', 'signup')
  // Private Page State ('dashboard', 'wallet', 'invest', 'kyc', 'admin_*')
  const [page, setPage] = useState('home'); 
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);

  const navigate = (p: string) => {
    setPage(p);
    // Reset admin selection if navigating away
    if (!p.startsWith('admin_user_detail')) {
      setAdminSelectedUserId(null);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('home'); // Go back to landing page on logout
  };

  // --- UNAUTHENTICATED ROUTING ---
  if (!user) {
    return (
      <PublicLayout onNavigate={navigate} currentPage={page}>
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'about' && <About />}
        {page === 'support' && <Support />}
        {page === 'login' && <Login onLogin={handleLogin} onNavigate={navigate} />}
        {page === 'signup' && <SignUp onLogin={handleLogin} onNavigate={navigate} />}
        {/* Fallback */}
        {![ 'home', 'about', 'support', 'login', 'signup' ].includes(page) && <Home onNavigate={navigate} />}
      </PublicLayout>
    );
  }

  // --- AUTHENTICATED ROUTING ---
  const renderPrivateContent = () => {
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
    <Layout user={user} onLogout={handleLogout} currentPage={page} onNavigate={navigate}>
      {renderPrivateContent()}
    </Layout>
  );
}