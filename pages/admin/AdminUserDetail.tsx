
import React, { useState, useEffect } from 'react';
import { User, AdminDisplayAmount } from '../../types';
import { api } from '../../services/api';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { ArrowLeft, ShieldAlert, CheckCircle, Save } from 'lucide-react';

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
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{user.fullName}</h1>
            <p className="text-slate-500 text-xs font-mono">UID: {user.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
           <Button variant="danger" size="sm">Freeze Account</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card title="Account Overview">
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Email Address</label>
                 <p className="text-white font-medium">{user.email}</p>
               </div>
               <div>
                 <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Verification Status</label>
                 <div className="mt-1"><Badge status={user.kycStatus} /></div>
               </div>
               <div>
                 <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Onboarding Date</label>
                 <p className="text-slate-300 font-medium">{new Date(user.joinedAt).toLocaleDateString()}</p>
               </div>
             </div>
          </Card>
          
          <Card title="Security Pulse">
            <div className="flex justify-between items-center py-2">
               <span className="text-slate-400 text-sm">Two-Factor Auth</span>
               <span className={user.twoFactorEnabled ? "text-green-400 font-bold text-xs" : "text-red-400 font-bold text-xs"}>
                 {user.twoFactorEnabled ? "ENABLED" : "DISABLED"}
               </span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Global Ledger">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">BTC Vault</span>
                  <p className="text-2xl font-black text-white">{user.balance.btc}</p>
                </div>
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">USDT Reserve</span>
                  <p className="text-2xl font-black text-white">{user.balance.usdt}</p>
                </div>
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">ETH Vault</span>
                  <p className="text-2xl font-black text-white">{user.balance.eth}</p>
                </div>
             </div>
             
             <div className="bg-indigo-950/20 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                 <div>
                   <h4 className="text-white font-black flex items-center text-xl uppercase tracking-tighter">
                     <ShieldAlert size={24} className="text-indigo-400 mr-3" />
                     Manual Balance Overlay
                   </h4>
                   <p className="text-sm text-slate-400 mt-3 max-w-lg leading-relaxed">
                     Inject promotional credits or perform correctional adjustments. Every alteration is permanently logged for compliance audits.
                   </p>
                 </div>
                 <Button onClick={() => setIsModalOpen(true)} className="shrink-0 px-8 py-4 rounded-2xl">Modify Ledger</Button>
               </div>
               
               {user.adminDisplayAdjustment && (
                 <div className="mt-8 p-6 bg-slate-950/80 rounded-2xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Active Adjustment Payload</span>
                       <span className="text-[10px] text-slate-600 font-mono">{new Date(user.adminDisplayAdjustment.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                       <div><span className="text-slate-500 block text-[10px] uppercase font-black mb-1">Value</span> <span className="text-white font-black text-lg">{user.adminDisplayAdjustment.amount} {user.adminDisplayAdjustment.currency}</span></div>
                       <div><span className="text-slate-500 block text-[10px] uppercase font-black mb-1">Classification</span> <span className="text-indigo-300 font-bold uppercase">{user.adminDisplayAdjustment.type}</span></div>
                       <div className="md:col-span-1"><span className="text-slate-500 block text-[10px] uppercase font-black mb-1">Audit Reason</span> <span className="text-slate-400 italic">"{user.adminDisplayAdjustment.reason}"</span></div>
                    </div>
                 </div>
               )}
             </div>
          </Card>

          <Card title="System Audit Logs">
             <div className="text-xs text-slate-600 italic text-center py-16 uppercase tracking-[0.2em] opacity-30">
               No recent administrative interceptions for this node.
             </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modify Node Ledger">
         <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Payload Value</label>
              <div className="flex space-x-3">
                 <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1" />
                 <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-blue-500">
                   <option>USD</option><option>BTC</option><option>USDT</option><option>ETH</option>
                 </select>
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Adjustment Class</label>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setType('cosmetic')} className={`p-5 rounded-2xl border text-left transition-all ${type === 'cosmetic' ? 'bg-blue-600/10 border-blue-500 text-blue-100 shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                    <span className="block font-black text-xs uppercase mb-1">Cosmetic</span>
                    <span className="text-[9px] opacity-60">Visual interface only. No ledger impact.</span>
                  </button>
                  <button onClick={() => setType('ledger_adjustment')} className={`p-5 rounded-2xl border text-left transition-all ${type === 'ledger_adjustment' ? 'bg-red-600/10 border-red-500 text-red-100 shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                    <span className="block font-black text-xs uppercase mb-1">Correction</span>
                    <span className="text-[9px] opacity-60">Full ledger adjustment. Strictly audited.</span>
                  </button>
               </div>
            </div>

            <Input label="Business Justification" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required for compliance logging..." />

            <div className="pt-6 border-t border-slate-700 flex justify-end space-x-4">
               <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Abort</Button>
               <Button size="sm" onClick={handleSetAmount} isLoading={processing} disabled={!amount || !reason}>Confirm Transmit</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
