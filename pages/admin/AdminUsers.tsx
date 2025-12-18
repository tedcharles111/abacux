import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { Badge, Button } from '../../components/ui';

interface AdminUsersProps {
  onNavigate: (page: string) => void;
  onSelectUser: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate, onSelectUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="text-white p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <Button onClick={() => {}} disabled variant="outline">Export CSV</Button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 uppercase text-xs font-semibold text-slate-500">
               <tr>
                 <th className="px-6 py-4">User Details</th>
                 <th className="px-6 py-4">Role</th>
                 <th className="px-6 py-4">KYC</th>
                 <th className="px-6 py-4">Balance (Est)</th>
                 <th className="px-6 py-4">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => {
                 // Simple estimation
                 const estimatedTotal = user.adminDisplayAdjustment?.visible 
                    ? user.adminDisplayAdjustment.amount 
                    : (user.balance.btc * 64230 + user.balance.eth * 3450 + user.balance.usdt);

                 return (
                  <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white mr-3">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.fullName}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded text-xs">{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={user.kycStatus} />
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {user.adminDisplayAdjustment?.visible && <span className="text-indigo-400 mr-2" title="Admin Adjusted">*</span>}
                      ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSelectUser(user.id)}
                        className="text-blue-400 hover:text-white font-medium hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between">
          <span>Showing {users.length} users</span>
          <span>Database Connected: YES</span>
        </div>
      </div>
    </div>
  );
};