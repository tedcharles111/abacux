
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { api, DB_UPDATE_EVENT } from '../../services/api';
import { Card, Button } from '../../components/ui';
import { Activity, Users, TrendingUp, ShieldCheck, ArrowRight, Database } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    recentUsers: [] as User[],
  });
  const [prices] = useState(api.getCurrentPrices());

  const loadStats = async () => {
    const users = await api.getUsers();
    const totalBal = users.reduce((sum, u) => {
      const bal = (u.balance.btc * prices.btc) + (u.balance.eth * prices.eth) + u.balance.usdt + u.balance.usd;
      return sum + bal;
    }, 0);

    setStats({
      totalUsers: users.length,
      totalBalance: totalBal,
      recentUsers: [...users].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5)
    });
  };

  useEffect(() => {
    loadStats();
    window.addEventListener(DB_UPDATE_EVENT, loadStats);
    window.addEventListener('storage', (e) => {
      if (e.key === 'abacusx_users_db') loadStats();
    });
    return () => {
      window.removeEventListener(DB_UPDATE_EVENT, loadStats);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Platform Overview</h1>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Real-time Ledger Monitoring
          </p>
        </div>
        <Button onClick={() => onNavigate('admin_users')} size="sm">
          Manage All Nodes <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group border-slate-700 bg-slate-800/40">
          <div className="absolute -right-4 -top-4 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
            <Users size={120} />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Total Network Nodes</p>
          <h2 className="text-4xl font-black text-white">{stats.totalUsers}</h2>
          <div className="mt-4 flex items-center text-xs text-green-400 font-bold">
            <TrendingUp size={14} className="mr-1" /> Active & Verified
          </div>
        </Card>

        <Card className="relative overflow-hidden group border-slate-700 bg-slate-800/40">
          <div className="absolute -right-4 -top-4 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
            <Database size={120} />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Total Assets Managed</p>
          <h2 className="text-4xl font-black text-white">
            ${stats.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
          <div className="mt-4 flex items-center text-xs text-indigo-400 font-bold">
            <Activity size={14} className="mr-1" /> 24h Yield Aggregation
          </div>
        </Card>

        <Card className="relative overflow-hidden group border-slate-700 bg-slate-800/40">
          <div className="absolute -right-4 -top-4 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
            <ShieldCheck size={120} />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Security Protocol</p>
          <h2 className="text-4xl font-black text-white">v4.3</h2>
          <div className="mt-4 flex items-center text-xs text-purple-400 font-bold">
            <ShieldCheck size={14} className="mr-1" /> Level 3 Cold Storage
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Recent Node Activity" className="border-slate-700 bg-slate-900/40">
            <div className="space-y-4">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-white">
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{u.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Joined</p>
                    <p className="text-xs text-white font-bold">{new Date(u.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {stats.recentUsers.length === 0 && (
                <div className="py-12 text-center text-slate-600 uppercase text-xs font-black tracking-widest italic opacity-30">
                  No registered nodes detected.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card title="System Alerts" className="border-slate-700 bg-slate-900/40">
            <div className="space-y-4">
               <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                 <p className="text-[10px] text-yellow-500 font-black uppercase mb-1">Notice</p>
                 <p className="text-xs text-slate-300">New nodes require manual verification for Tier 2 access.</p>
               </div>
               <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                 <p className="text-[10px] text-blue-500 font-black uppercase mb-1">Info</p>
                 <p className="text-xs text-slate-300">API throughput is currently within optimal parameters.</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
