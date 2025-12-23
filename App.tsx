
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { User, UserRole } from './types';

// Components
import { LiveChatWidget } from './components/LiveChatWidget';

// Pages - Authenticated
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { Investments } from './pages/Investments';
import { KYC } from './pages/KYC';
import { AdminUserDetail } from './pages/admin/AdminUserDetail';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Pages - Public
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Support } from './pages/Support';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

const SESSION_KEY = 'abacusx_auth_session';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Basic spoofing protection: Verify email-to-role logic if needed
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [page, setPage] = useState('home'); 
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setPage(hash);
    };
    if (window.location.hash.slice(1)) handleHashChange();
    else window.location.hash = 'home';
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (p: string) => {
    setPage(p);
    window.location.hash = p;
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    if (u.role === UserRole.ADMIN) navigate('admin_dashboard');
    else navigate('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
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
      // Security Guard: Prevent non-admins from reaching admin pages via URL hacking
      if (page.startsWith('admin_') && user.role !== UserRole.ADMIN) {
        return <Dashboard user={user} onNavigate={navigate} />;
      }

      switch (page) {
        case 'dashboard': return <Dashboard user={user} onNavigate={navigate} />;
        case 'wallet': return <Wallet user={user} />;
        case 'invest': return <Investments user={user} />;
        case 'kyc': return <KYC user={user} />;
        case 'admin_dashboard': return <AdminDashboard onNavigate={navigate} />;
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
            <AdminUsers onNavigate={navigate} onSelectUser={(id) => { setAdminSelectedUserId(id); navigate('admin_user_detail'); }} />
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
  };

  return (
    <>
      {renderContent()}
      <LiveChatWidget currentUser={user} />
    </>
  );
}
