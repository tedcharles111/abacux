
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../../types';
import { api, DB_UPDATE_EVENT, SYSTEM_LOG_EVENT } from '../../services/api';
import { Card, Button } from '../../components/ui';
import { Activity, Users, TrendingUp, ShieldCheck, ArrowRight, Database, Wifi, Terminal } from 'lucide-react';

interface SystemLog {
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  timestamp: string;
}

export const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, recentUsers: [] as User[] });
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [syncPulse, setSyncPulse] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const prices = api.getCurrentPrices();

  const loadData = useCallback(async () => {
    const users = await api.getUsers();
    const totalBal = users.reduce((sum, u) => {
      return sum + (u.balance.btc * prices.btc) + (u.balance.eth * prices.eth) + u.balance.usdt + u.balance.usd;
    }, 0);
    setStats({
      totalUsers: users.length,
      totalBalance: totalBal,
      recentUsers: [...users].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5)
    });
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 500);
  }, [prices]);

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    const handleLog = (e: any) => setLogs(prev => [e.detail, ...prev].slice(0, 50));

    window.addEventListener(DB_UPDATE_EVENT, handleDbUpdate);
    window.addEventListener(SYSTEM_LOG_EVENT, handleLog);
    const interval = setInterval(loadData, 5000);

    return () => {
      window.removeEventListener(DB_UPDATE_EVENT, handleDbUpdate);
      window.removeEventListener(SYSTEM_LOG_EVENT, handleLog);
      clearInterval(interval);
    };
  }, [loadData]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">System Terminal</h1>
          <div className="flex items-center space-x-3 mt-1">
            <span className={`w-2 h-2 rounded-full ${syncPulse ? 'bg-blue-400' : 'bg-green-500'} transition-colors duration-300 animate-pulse`}></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Network Health: Optimal</p>
          </div>
        </div>
        <Button onClick={() => onNavigate('admin_users')} size="sm" variant="outline">
          Active Nodes: {stats.totalUsers} <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Live Liquidity</p>
          <h2 className="text-4xl font-black text-white">${stats.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Verified Clusters</p>
          <h2 className="text-4xl font-black text-white">{stats.totalUsers}</h2>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Security Version</p>
          <h2 className="text-4xl font-black text-white">v6.2-PROD</h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Live Event Logs" className="bg-slate-900 border-slate-800 h-[400px] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 bg-slate-950">
              {logs.map((log, i) => (
                <div key={i} className="flex space-x-3 animate-in fade-in slide-in-from-left-2">
                  <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={log.type === 'SUCCESS' ? 'text-green-400' : log.type === 'WARNING' ? 'text-yellow-500' : 'text-blue-400'}>
                    {log.type}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && <div className="text-slate-700">Awaiting system events...</div>}
              <div ref={logEndRef} />
            </div>
            <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center">
                <Terminal size={12} className="mr-2" /> Kernel Audit Active
              </span>
              <button onClick={() => setLogs([])} className="text-[9px] text-slate-600 hover:text-slate-400 uppercase font-black">Clear Buffer</button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Recent Nodes" className="bg-slate-800/30 border-slate-700/50">
            <div className="space-y-4">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{u.fullName}</p>
                      <p className="text-[9px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <Wifi size={12} className="text-green-500 opacity-50" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
