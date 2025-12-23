
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { api, DB_UPDATE_EVENT } from '../../services/api';
import { Badge, Button } from '../../components/ui';
import { RefreshCw, Search, Filter, Download, Activity, Database, UserPlus } from 'lucide-react';

// Centralize the storage key to match api.ts
const USERS_STORAGE_KEY = 'abacusx_prod_v1';

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
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await api.getUsers();
      // Directly update users to ensure absolute UI consistency
      setUsers([...data]);
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

    // Polling Interval (The Safety Net)
    const pollInterval = setInterval(() => {
      fetchUsers(true);
    }, 2000);

    // Event Listeners
    const handlePriceUpdate = (e: any) => {
      if (e.detail) setPrices({ ...e.detail });
    };

    const handleDbUpdate = () => {
      fetchUsers(true);
    };

    const handleStorageChange = (e: StorageEvent) => {
      // FIX: Use the correct production storage key
      if (e.key === USERS_STORAGE_KEY) {
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

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw className="text-blue-500 animate-spin" size={32} />
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Synchronizing User Nodes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">User Management</h1>
          <div className="flex items-center space-x-2 text-[10px] mt-1 font-bold">
             <span className="flex items-center text-green-400">
               <span className="relative flex h-1.5 w-1.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                LIVE CLUSTER SYNC
             </span>
             <span className="text-slate-700">•</span>
             <span className="text-slate-500 uppercase tracking-widest">Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Button 
            onClick={() => fetchUsers(false)} 
            variant="outline" 
            size="sm" 
            className="flex-1 md:flex-none border-slate-700 text-[10px] uppercase font-black"
            isLoading={refreshing}
          >
            <RefreshCw size={12} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none opacity-50 cursor-not-allowed border-slate-700 text-[10px] uppercase font-black">
            <Download size={12} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Search by name, email, or UID..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 uppercase text-[10px] font-black text-slate-500 tracking-widest border-b border-slate-700">
               <tr>
                 <th className="px-6 py-5">Node Identity</th>
                 <th className="px-6 py-5">Authorization</th>
                 <th className="px-6 py-5">Compliance Status</th>
                 <th className="px-6 py-5">Total Valuation</th>
                 <th className="px-6 py-5 text-right">Administrative Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => {
                 const estimatedTotal = calculateEstimation(user);

                 return (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white mr-4 border border-slate-600 shadow-inner group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{user.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-tight">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-900 text-slate-400 border border-slate-700 px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={user.kycStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {user.adminDisplayAdjustment?.visible && (
                          <span className="text-indigo-400 mr-1" title="Active Ledger Overlay">
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
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-blue-500/20"
                      >
                        Adjust Ledger
                      </button>
                    </td>
                  </tr>
                 );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <Database size={48} className="text-slate-600 mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs italic">
                        No User Nodes Detected in Cluster
                      </p>
                      <Button 
                        onClick={() => onNavigate('admin_dashboard')} 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-[10px] font-black uppercase"
                      >
                        Return to Dashboard
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 text-[9px] text-slate-600 flex justify-between items-center font-bold uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Kernel Sync: Synchronized</span>
          </div>
          <span className="opacity-50">PROD-SYNC-v1.0.4</span>
        </div>
      </div>
    </div>
  );
};
