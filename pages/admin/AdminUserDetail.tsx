import React, { useState, useEffect } from 'react';
import { User, AdminDisplayAmount } from '../../types';
import { api } from '../../services/api';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { ArrowLeft, ShieldAlert, CheckCircle, Save } from 'lucide-react';

interface Props {
  userId: string;
  onBack: () => void;
}

export const AdminUserDetail: React.FC<Props> = ({ userId, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState<'cosmetic' | 'ledger_adjustment'>('cosmetic');
  const [reason, setReason] = useState('');
  const [visible, setVisible] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    const u = await api.getUser(userId);
    if (u) setUser(u);
    setLoading(false);
  };

  const handleSetAmount = async () => {
    if (!user) return;
    setProcessing(true);
    
    const payload: AdminDisplayAmount = {
      amount: parseFloat(amount),
      currency,
      type,
      reason,
      visible,
      timestamp: new Date().toISOString(),
      adminName: 'Sys Admin' // In real app, get from auth context
    };

    await api.updateUserDisplayAmount(user.id, payload);
    await loadUser(); // refresh
    setProcessing(false);
    setIsModalOpen(false);
  };

  if (loading || !user) return <div className="text-white">Loading user details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-white">User Management</h1>
           <p className="text-slate-400 text-sm">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info */}
        <div className="space-y-6">
          <Card title="Profile">
             <div className="space-y-4">
               <div>
                 <label className="text-xs text-slate-500 uppercase">Full Name</label>
                 <p className="text-white font-medium">{user.fullName}</p>
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">Email</label>
                 <p className="text-white font-medium">{user.email}</p>
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">KYC Status</label>
                 <div className="mt-1"><Badge status={user.kycStatus} /></div>
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase">Joined</label>
                 <p className="text-slate-300">{new Date(user.joinedAt).toLocaleDateString()}</p>
               </div>
             </div>
          </Card>
          
          <Card title="Security">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
               <span className="text-slate-300">2FA Enabled</span>
               <span className={user.twoFactorEnabled ? "text-green-400" : "text-red-400"}>
                 {user.twoFactorEnabled ? "Yes" : "No"}
               </span>
            </div>
            <div className="mt-4">
               <Button variant="danger" size="sm" className="w-full">Freeze Account</Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Wallet & Ledger">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">BTC</span>
                  <p className="text-lg font-bold text-white">{user.balance.btc}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">USDT</span>
                  <p className="text-lg font-bold text-white">{user.balance.usdt}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">ETH</span>
                  <p className="text-lg font-bold text-white">{user.balance.eth}</p>
                </div>
             </div>
             
             <div className="bg-indigo-900/10 border border-indigo-900/50 p-4 rounded-lg">
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className="text-white font-semibold flex items-center">
                     <ShieldAlert size={16} className="text-indigo-400 mr-2" />
                     Display Amount Override
                   </h4>
                   <p className="text-sm text-slate-400 mt-1">
                     Set a custom balance amount visible to the user. This can be cosmetic (promo) or a real ledger adjustment.
                   </p>
                 </div>
                 <Button onClick={() => setIsModalOpen(true)}>Set Amount</Button>
               </div>
               
               {user.adminDisplayAdjustment && (
                 <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700">
                    <p className="text-xs text-slate-500 uppercase mb-2">Current Active Adjustment</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div><span className="text-slate-500">Amount:</span> <span className="text-white font-bold">{user.adminDisplayAdjustment.amount} {user.adminDisplayAdjustment.currency}</span></div>
                       <div><span className="text-slate-500">Type:</span> <span className="text-white">{user.adminDisplayAdjustment.type}</span></div>
                       <div className="col-span-2"><span className="text-slate-500">Reason:</span> <span className="text-white">{user.adminDisplayAdjustment.reason}</span></div>
                    </div>
                 </div>
               )}
             </div>
          </Card>

          <Card title="Action Audit Log">
             <div className="text-sm text-slate-500 text-center py-8">
               No recent sensitive actions recorded for this user.
             </div>
          </Card>
        </div>
      </div>

      {/* Set Amount Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Display Amount">
         <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-800 p-3 rounded text-sm text-yellow-200">
               Warning: This action will be logged in the immutable audit trail.
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Amount</label>
              <div className="flex space-x-2">
                 <Input 
                   type="number" 
                   value={amount} 
                   onChange={(e) => setAmount(e.target.value)} 
                   placeholder="0.00"
                 />
                 <select 
                   value={currency} 
                   onChange={(e) => setCurrency(e.target.value)}
                   className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                 >
                   <option value="USD">USD</option>
                   <option value="BTC">BTC</option>
                   <option value="USDT">USDT</option>
                   <option value="ETH">ETH</option>
                 </select>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">Adjustment Type</label>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setType('cosmetic')}
                    className={`p-3 rounded-lg border text-left transition-colors ${type === 'cosmetic' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    <span className="block font-bold">Cosmetic</span>
                    <span className="text-xs opacity-70">Visual only. Does not affect ledger.</span>
                  </button>
                  <button 
                    onClick={() => setType('ledger_adjustment')}
                    className={`p-3 rounded-lg border text-left transition-colors ${type === 'ledger_adjustment' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    <span className="block font-bold">Ledger Adj.</span>
                    <span className="text-xs opacity-70">Changes real balance. Requires 2FA.</span>
                  </button>
               </div>
            </div>

            <Input 
              label="Reason (Required)" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Promotional Bonus Dec 2024"
            />

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="visible" 
                checked={visible} 
                onChange={(e) => setVisible(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="visible" className="text-sm text-slate-300">Visible to User on Dashboard</label>
            </div>
            
            <div className="pt-4 border-t border-slate-700 flex justify-end space-x-3">
               <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button onClick={handleSetAmount} isLoading={processing} disabled={!amount || !reason}>
                 <Save size={16} className="mr-2" />
                 Confirm & Save
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
