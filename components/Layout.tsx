
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Badge } from './ui';
import { 
  LayoutDashboard, Wallet, TrendingUp, ShieldCheck, 
  Settings, LogOut, Menu, X, Users, Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavItem = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => (
    <button
      onClick={() => { onNavigate(page); setSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        currentPage === page ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              AbacusX
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {/* User Navigation - Hidden for Admins */}
            {user?.role !== UserRole.ADMIN && (
              <>
                <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem page="wallet" icon={Wallet} label="Wallet" />
                <NavItem page="invest" icon={TrendingUp} label="Investments" />
                <NavItem page="kyc" icon={ShieldCheck} label="Identity (KYC)" />
              </>
            )}
            
            {/* Admin Navigation */}
            {user?.role === UserRole.ADMIN && (
              <>
                <div className="px-4 pb-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/50">Admin Console</div>
                <NavItem page="admin_dashboard" icon={Activity} label="Overview" />
                <NavItem page="admin_users" icon={Users} label="User Management" />
              </>
            )}
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              aria-label="Sign Out"
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Mobile) */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900">
           <span className="text-xl font-bold text-white">AbacusX</span>
           <button onClick={() => setSidebarOpen(true)} className="text-slate-400 p-2">
             <Menu size={24} />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};
