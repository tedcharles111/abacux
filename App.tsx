
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { User, UserRole } from './types';
import { LiveChatWidget } from './components/LiveChatWidget';

// Pages - Authenticated
import { Dashboard } from './pages/Dashboard';
import { AdminUserDetail } from './pages/admin/AdminUserDetail';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSupport } from './pages/admin/AdminSupport';

// Pages - Public
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Support } from './pages/Support';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

const PlaceholderPage: React.FC<{title: string}> = ({title}) => (
  <div className="text-white p-8 border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center min-h-[400px]">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-slate-400 mb-6">This module is part of the full implementation.</p>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('home'); 
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setPage(hash);
      }
    };
    if (window.location.hash.slice(1)) handleHashChange();
    else window.location.hash = 'home';
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (p: string) => {
    setPage(p);
    if (!p.startsWith('admin_user_detail')) {
      // Don't reset if we are navigating explicitly
    }
    window.location.hash = p;
  };

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.role === UserRole.ADMIN) {
      navigate('admin_dashboard');
    } else {
      navigate('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('home');
  };

  const renderContent = () => {
    if (!user) {
      return (
        <PublicLayout onNavigate={navigate} currentPage={page}>
          {page === 'home' && <Home onNavigate={navigate} />}
          {page === 'about' && <About />}
          {page === 'support' && <Support />}
          {page === 'login' && <Login onLogin={handleLogin} onNavigate={navigate} />}
          {page === 'signup' && <SignUp onLogin={handleLogin} onNavigate={navigate} />}
          {![ 'home', 'about', 'support', 'login', 'signup' ].includes(page) && <Home onNavigate={navigate} />}
        </PublicLayout>
      );
    }

    const renderPrivateContent = () => {
      switch (page) {
        case 'dashboard': return <Dashboard user={user} onNavigate={navigate} />;
        case 'wallet': return <PlaceholderPage title="Wallet & Deposits" />;
        case 'invest': return <PlaceholderPage title="Investment Plans" />;
        case 'kyc': return <PlaceholderPage title="Identity Verification" />;
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
            <AdminUsers 
              onNavigate={navigate} 
              onSelectUser={(userId) => {
                setAdminSelectedUserId(userId);
                navigate('admin_user_detail');
              }} 
            />
          );
        case 'admin_user_detail':
          return adminSelectedUserId ? (
            <AdminUserDetail userId={adminSelectedUserId} onBack={() => navigate('admin_users')} onNavigate={navigate} />
          ) : (
            <AdminUsers 
              onNavigate={navigate} 
              onSelectUser={(userId) => {
                setAdminSelectedUserId(userId);
                navigate('admin_user_detail');
              }} 
            />
          );
        case 'admin_support':
          return <AdminSupport />;
        default:
          return <Dashboard user={user} onNavigate={navigate} />;
      }
    };

    return (
      <Layout user={user} onLogout={handleLogout} currentPage={page} onNavigate={navigate}>
        {renderPrivateContent()}
      </Layout>
    );
  };

  return (
    <>
      {renderContent()}
      <LiveChatWidget user={user} />
    </>
  );
}
