
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { api, DB_UPDATE_EVENT } from '../../services/api';
import { Badge, Button } from '../../components/ui';
import { RefreshCw, Search, Filter, Download, Activity, Database } from 'lucide-react';

interface AdminUsersProps {
  onNavigate: (page: string) => void;
  onSelectUser: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate, onSelectUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prices, setPrices] = useState(api.getCurrentPrices());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await api.getUsers();
      // Only update state if data length differs or upon explicit refresh to avoid render thrashing
      setUsers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) {
           return [...data];
        }
        return prev;
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      if (!isSilent) setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // 1. Polling Interval (The Safety Net)
    // Fetches every 2 seconds to guarantee consistency across tabs/windows
    const pollInterval = setInterval(() => {
      fetchUsers(true);
    }, 2000);

    // 2. Event Listeners (Instant Reactivity)
    const handlePriceUpdate = (e: any) => {
      setPrices({ ...e.detail });
    };

    const handleDbUpdate = () => {
      fetchUsers(true);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'abacusx_users_db') {
        fetchUsers(true);
      }
    };

    window.addEventListener('market_price_update', handlePriceUpdate);
    window.addEventListener(DB_UPDATE_EVENT, handleDbUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('market_price_update', handlePriceUpdate);
      window.removeEventListener(DB_UPDATE_EVENT, handleDbUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUsers]);

  const calculateEstimation = (user: User) => {
    if (user.adminDisplayAdjustment?.visible) {
      return user.adminDisplayAdjustment.amount;
    }
    return (
      (user.balance.btc * prices.btc) + 
      (user.balance.eth * prices.eth) + 
      user.balance.usdt + 
      user.balance.usd
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <RefreshCw className="text-blue-500 animate-spin" size={32} />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Synchronizing User Nodes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">User Management</h1>
          <div className="flex items-center space-x-2 text-xs mt-1">
             <span className="flex items-center text-green-400 font-bold">
               <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Sync Active
             </span>
             <span className="text-slate-600">•</span>
             <span className="text-slate-500">Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Button 
            onClick={() => fetchUsers(false)} 
            variant="outline" 
            size="sm" 
            className="flex-1 md:flex-none"
            isLoading={refreshing}
          >
            <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Force Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none opacity-50 cursor-not-allowed">
            <Download size={14} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
               <Activity size={20} />
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-500 font-black uppercase">Active Sessions</p>
               <p className="text-lg font-black text-white">{users.length}</p>
            </div>
         </div>
         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
               <Database size={20} />
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-500 font-black uppercase">Database Nodes</p>
               <p className="text-lg font-black text-white">{users.length}</p>
            </div>
         </div>
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 uppercase text-[10px] font-black text-slate-500 tracking-widest border-b border-slate-700">
               <tr>
                 <th className="px-6 py-5">Node / User Details</th>
                 <th className="px-6 py-5">Authorization</th>
                 <th className="px-6 py-5">Compliance</th>
                 <th className="px-6 py-5">Portfolio Value</th>
                 <th className="px-6 py-5 text-right">Operations</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => {
                 const estimatedTotal = calculateEstimation(user);

                 return (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white mr-3 border border-slate-600 shadow-inner">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{user.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-900 text-slate-400 border border-slate-700 px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={user.kycStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {user.adminDisplayAdjustment?.visible && (
                          <span className="text-indigo-400" title="Admin Adjusted Balance Activated">
                            <Activity size={12} className="animate-pulse" />
                          </span>
                        )}
                        <span className="font-mono font-bold text-white">
                          ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onSelectUser(user.id)}
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-blue-500/20"
                      >
                        Access Dashboard
                      </button>
                    </td>
                  </tr>
                 );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs italic opacity-50">
                    No active nodes found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 text-[10px] text-slate-500 flex justify-between items-center font-bold uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Database Interface: Synchronized</span>
          </div>
          <span className="opacity-50">v4.3.0-Polling-Enabled</span>
        </div>
      </div>
    </div>
  );
};
