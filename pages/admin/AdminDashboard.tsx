
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, UserRole, KYCStatus } from '../../types';
import { api, DB_UPDATE_EVENT, SYSTEM_LOG_EVENT } from '../../services/api';
import { Card, Button } from '../../components/ui';
import { Activity, Users, TrendingUp, ShieldCheck, ArrowRight, Database, Wifi, Terminal, AlertTriangle, UserPlus, Server, Lock, Unlock } from 'lucide-react';

interface SystemLog {
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  timestamp: string;
}

export const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, recentUsers: [] as User[] });
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [syncPulse, setSyncPulse] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [isPermitted, setIsPermitted] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const prices = api.getCurrentPrices();

  const loadData = useCallback(async () => {
    const [users, storedLogs] = await Promise.all([
      api.getUsers(),
      api.getSystemLogs()
    ]);

    const totalBal = users.reduce((sum, u) => {
      return sum + (u.balance.btc * prices.btc) + (u.balance.eth * prices.eth) + u.balance.usdt + u.balance.usd;
    }, 0);

    setStats({
      totalUsers: users.length,
      totalBalance: totalBal,
      recentUsers: [...users].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()).slice(0, 5)
    });

    setLogs(storedLogs);
    setSyncPulse(true);
    setIsPermitted(true); // Explicitly set permission after successful data load
    setTimeout(() => setSyncPulse(false), 500);
  }, [prices]);

  const provisionSystem = async () => {
    setProvisioning(true);
    try {
      const mockUsers = [
        { name: 'Michael Burry', email: 'michael@scion-asset.com' },
        { name: 'Cathie Wood', email: 'cathie@ark-invest.com' },
        { name: 'Satoshi Nakamoto', email: 'satoshin@p2pfoundation.org' }
      ];
      for (const u of mockUsers) {
        await api.register(u.name, u.email, 'password123');
      }
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setProvisioning(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    const handleLog = (e: any) => setLogs(prev => [e.detail, ...prev].slice(0, 100));

    window.addEventListener(DB_UPDATE_EVENT, handleDbUpdate);
    window.addEventListener(SYSTEM_LOG_EVENT, handleLog);
    const interval = setInterval(loadData, 10000);

    return () => {
      window.removeEventListener(DB_UPDATE_EVENT, handleDbUpdate);
      window.removeEventListener(SYSTEM_LOG_EVENT, handleLog);
      clearInterval(interval);
    };
  }, [loadData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECURITY BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-4 ${isPermitted ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {isPermitted ? <Unlock size={20} /> : <Lock size={20} />}
          </div>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-tighter">
              {isPermitted ? 'Access Level: Institutional Admin' : 'Access Restricted'}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Security Protocol: <span className={isPermitted ? 'text-green-500' : 'text-red-500'}>{isPermitted ? 'GRANTED' : 'DENIED'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-600">
          <div>LATENCY: 14ms</div>
          <div>RESOURCE: kernel_logs_cluster_01</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">System Terminal</h1>
          <div className="flex items-center space-x-3 mt-1">
            <span className={`w-2 h-2 rounded-full ${syncPulse ? 'bg-blue-400' : 'bg-green-500'} transition-colors duration-300 animate-pulse`}></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Telemetry: Synchronized</p>
          </div>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          {stats.totalUsers < 2 && (
             <Button onClick={provisionSystem} size="sm" variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] uppercase font-black" isLoading={provisioning}>
               <Server size={14} className="mr-2" /> Provision System
             </Button>
          )}
          <Button onClick={() => onNavigate('admin_users')} size="sm" variant="primary" className="text-[10px] uppercase font-black px-6">
            User Nodes <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Network Liquidity</p>
          <h2 className="text-4xl font-black text-white">${stats.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Active Node Count</p>
          <h2 className="text-4xl font-black text-white">{stats.totalUsers}</h2>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Kernel Status</p>
          <h2 className="text-4xl font-black text-white text-green-500">OPTIMAL</h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Kernel Audit Logs" className="bg-slate-900 border-slate-800 h-[450px] flex flex-col p-0 overflow-hidden shadow-2xl">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 bg-black/40">
              {logs.map((log, i) => (
                <div key={i} className="flex space-x-3 animate-in fade-in slide-in-from-left-2 group">
                  <span className="text-slate-700 group-hover:text-slate-500 transition-colors">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-bold ${log.type === 'SUCCESS' ? 'text-green-500' : log.type === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'}`}>
                    {log.type}
                  </span>
                  <span className="text-slate-400 group-hover:text-white transition-colors">{log.message}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Terminal size={48} className="mb-4" />
                  <p className="text-xs uppercase font-black tracking-widest">Handshaking with Kernel...</p>
                </div>
              )}
              <div ref={logEndRef} />
            </div>
            <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center">
                <Terminal size={12} className="mr-2" /> Log Stream: {isPermitted ? 'AUTHORIZED' : 'ACCESSING...'}
              </span>
              <button 
                onClick={() => { localStorage.removeItem('abacusx_logs_v1'); setLogs([]); }} 
                className="text-[9px] text-red-500/50 hover:text-red-500 uppercase font-black transition-colors"
              >
                Purge Ledger
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Node Topology" className="bg-slate-800/30 border-slate-700/50">
            <div className="space-y-4">
              {stats.recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800 group hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{u.fullName}</p>
                      <p className="text-[9px] text-slate-500 font-mono tracking-tighter">{u.email}</p>
                    </div>
                  </div>
                  <Wifi size={12} className="text-green-500 opacity-50" />
                </div>
              ))}
              {stats.totalUsers === 0 && (
                <div className="text-center py-10 opacity-30">
                  <Users className="mx-auto mb-2 text-slate-600" />
                  <p className="text-[10px] font-black uppercase">No active nodes</p>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest border-slate-700" onClick={() => onNavigate('admin_users')}>Full Node List</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
