
import React, { useState, useEffect } from 'react';
import { User, AdminDisplayAmount } from '../../types';
import { api } from '../../services/api';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { ArrowLeft, ShieldAlert, CheckCircle, Save, MessageSquare } from 'lucide-react';

interface Props {
  userId: string;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export const AdminUserDetail: React.FC<Props> = ({ userId, onBack, onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
      adminName: 'Sys Admin'
    };

    await api.updateUserDisplayAmount(user.id, payload);
    await loadUser();
    setProcessing(false);
    setIsModalOpen(false);
  };

  if (loading || !user) return <div className="text-white p-8">Loading user details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
            <p className="text-slate-400 text-sm">UID: {user.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline" onClick={() => onNavigate?.('admin_support')}>
              <MessageSquare size={18} className="mr-2" />
              Live Chat Support
           </Button>
           <Button variant="danger">Freeze Account</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card title="Account Overview">
             <div className="space-y-4">
               <div>
                 <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                 <p className="text-white">{user.email}</p>
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase font-bold">Verification</label>
                 <div className="mt-1"><Badge status={user.kycStatus} /></div>
               </div>
               <div>
                 <label className="text-xs text-slate-500 uppercase font-bold">Member Since</label>
                 <p className="text-slate-300">{new Date(user.joinedAt).toLocaleDateString()}</p>
               </div>
             </div>
          </Card>
          
          <Card title="Security Status">
            <div className="flex justify-between items-center py-2">
               <span className="text-slate-400">2FA Status</span>
               <span className={user.twoFactorEnabled ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                 {user.twoFactorEnabled ? "ENABLED" : "DISABLED"}
               </span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Ledger Management">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">BTC Balance</span>
                  <p className="text-xl font-bold text-white">{user.balance.btc}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">USDT Balance</span>
                  <p className="text-xl font-bold text-white">{user.balance.usdt}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">ETH Balance</span>
                  <p className="text-xl font-bold text-white">{user.balance.eth}</p>
                </div>
             </div>
             
             <div className="bg-indigo-950/20 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                   <h4 className="text-white font-bold flex items-center text-lg">
                     <ShieldAlert size={20} className="text-indigo-400 mr-2" />
                     Balance Override
                   </h4>
                   <p className="text-sm text-slate-400 mt-2 max-w-lg">
                     Apply cosmetic bonuses or perform manual ledger adjustments. Every change is tracked in the immutable audit trail.
                   </p>
                 </div>
                 <Button onClick={() => setIsModalOpen(true)} className="shrink-0">Set New Balance</Button>
               </div>
               
               {user.adminDisplayAdjustment && (
                 <div className="mt-6 p-4 bg-slate-950/50 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active Adjustment</span>
                       <span className="text-[10px] text-slate-500">{new Date(user.adminDisplayAdjustment.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                       <div><span className="text-slate-500">Value:</span> <span className="text-white font-bold">{user.adminDisplayAdjustment.amount} {user.adminDisplayAdjustment.currency}</span></div>
                       <div><span className="text-slate-500">Mode:</span> <span className="text-indigo-300 font-medium">{user.adminDisplayAdjustment.type}</span></div>
                       <div><span className="text-slate-500">Reason:</span> <span className="text-slate-300 italic">"{user.adminDisplayAdjustment.reason}"</span></div>
                    </div>
                 </div>
               )}
             </div>
          </Card>

          <Card title="Activity Log">
             <div className="text-sm text-slate-600 italic text-center py-12">
               No recent system alerts for this account.
             </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Ledger/Display">
         <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Target Balance</label>
              <div className="flex space-x-2">
                 <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1" />
                 <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white">
                   <option>USD</option><option>BTC</option><option>USDT</option><option>ETH</option>
                 </select>
              </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-400 mb-2">Adjustment Type</label>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setType('cosmetic')} className={`p-4 rounded-xl border text-left transition-all ${type === 'cosmetic' ? 'bg-blue-600/10 border-blue-500 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                    <span className="block font-bold mb-1">Cosmetic</span>
                    <span className="text-[10px] opacity-70">Visual only. Promo purpose.</span>
                  </button>
                  <button onClick={() => setType('ledger_adjustment')} className={`p-4 rounded-xl border text-left transition-all ${type === 'ledger_adjustment' ? 'bg-red-600/10 border-red-500 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                    <span className="block font-bold mb-1">Ledger Adj.</span>
                    <span className="text-[10px] opacity-70">Changes real balance. Audited.</span>
                  </button>
               </div>
            </div>

            <Input label="Business Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required for compliance log" />

            <div className="pt-4 border-t border-slate-700 flex justify-end space-x-3">
               <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button onClick={handleSetAmount} isLoading={processing} disabled={!amount || !reason}>Save Changes</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
