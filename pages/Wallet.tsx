
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Card, Button, Badge } from '../components/ui';
import { api } from '../services/api';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, History, Copy, ExternalLink, TrendingUp } from 'lucide-react';

interface WalletProps {
  user: User;
}

export const Wallet: React.FC<WalletProps> = ({ user }) => {
  const [prices, setPrices] = useState(api.getCurrentPrices());
  
  useEffect(() => {
    const handlePriceUpdate = (e: any) => setPrices({ ...e.detail });
    window.addEventListener('market_price_update', handlePriceUpdate);
    return () => window.removeEventListener('market_price_update', handlePriceUpdate);
  }, []);

  const adminAdj = user.adminDisplayAdjustment;
  const showAdminAdj = adminAdj?.visible;

  // Real-time Balance calculation (Shared logic with Dashboard)
  const realBalance = (user.balance.btc * prices.btc) + (user.balance.eth * prices.eth) + user.balance.usdt + user.balance.usd;
  const displayValue = showAdminAdj ? adminAdj.amount : realBalance;
  const displayCurrency = showAdminAdj ? adminAdj.currency : 'USD';

  const assets = [
    { name: 'Bitcoin', symbol: 'BTC', amount: user.balance.btc, price: prices.btc, color: 'bg-orange-500', icon: '₿' },
    { name: 'Ethereum', symbol: 'ETH', amount: user.balance.eth, price: prices.eth, color: 'bg-blue-500', icon: 'Ξ' },
    { name: 'Tether', symbol: 'USDT', amount: user.balance.usdt, price: 1.00, color: 'bg-green-500', icon: '₮' },
    { name: 'US Dollar', symbol: 'USD', amount: user.balance.usd, price: 1.00, color: 'bg-slate-500', icon: '$' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <WalletIcon className="mr-3 text-blue-500" size={24} /> My Digital Wallet
          </h1>
          <p className="text-slate-400 text-sm">Manage your assets and track your portfolio value in real-time.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline" size="sm">
             <History size={16} className="mr-2" /> Activity
           </Button>
           <Button size="sm">
             <ArrowDownLeft size={16} className="mr-2" /> Deposit
           </Button>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-2">Total Estimated Balance</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-5xl font-black text-white">
              {displayCurrency === 'USD' || displayCurrency === 'USDT' ? '$' : ''}
              {displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className="text-xl text-blue-200 font-bold">{displayCurrency}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Profit (24h)</span>
              <span className="text-white font-bold text-sm">+ $124.50</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-blue-200 uppercase font-bold block">Account Level</span>
              <span className="text-white font-bold text-sm">Verified Tier 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <Card key={asset.symbol} className="hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 ${asset.color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                {asset.icon}
              </div>
              <Badge status="Live" className="bg-green-500/10 text-green-500 border-none px-2" />
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{asset.name}</h3>
            <div className="mt-1">
              <p className="text-xl font-bold text-white">{asset.amount} <span className="text-sm font-medium text-slate-500">{asset.symbol}</span></p>
              <p className="text-sm text-slate-400 font-mono">≈ ${(asset.amount * asset.price).toLocaleString()}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase">Trade</button>
               <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase">History</button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit Address Section */}
        <Card title="Instant Deposit" className="lg:col-span-2">
           <div className="space-y-6">
             <div className="flex items-center p-4 bg-slate-900 rounded-2xl border border-slate-700">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Your Personal BTC Address</p>
                  <p className="text-white font-mono text-sm break-all">bc1qxy2kg786ghdxm6psdh9c9sy786ghdxm6p...</p>
                </div>
                <button className="p-3 hover:bg-slate-800 rounded-xl text-blue-400 transition-colors">
                  <Copy size={20} />
                </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 text-center">
                   <p className="text-xs text-slate-500 font-bold uppercase mb-2">Network</p>
                   <p className="text-white font-bold">Bitcoin (SegWit)</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 text-center">
                   <p className="text-xs text-slate-500 font-bold uppercase mb-2">Min. Deposit</p>
                   <p className="text-white font-bold">0.0001 BTC</p>
                </div>
             </div>
             <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl flex items-start space-x-3">
                <TrendingUp size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200 leading-relaxed">
                  Funds will be credited automatically after 2 network confirmations. Your private keys are secured with MPC technology.
                </p>
             </div>
           </div>
        </Card>

        {/* Withdrawal Quick Action */}
        <Card title="Quick Withdrawal">
           <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Asset</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
                   <option>USDT (TRC20)</option>
                   <option>BTC (Native)</option>
                   <option>ETH (ERC20)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Destination Address</label>
                <input 
                  type="text" 
                  placeholder="Paste address here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
              <Button className="w-full py-4 mt-2">Request Payout</Button>
              <p className="text-[10px] text-slate-500 text-center font-bold uppercase">Estimated Fee: 0.00 USDT</p>
           </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card title="Recent Transactions">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-700/50">
                  <tr>
                    <th className="pb-4">Transaction</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/30">
                  <tr className="group">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                          <ArrowDownLeft size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">BTC Deposit</p>
                          <p className="text-[10px] text-slate-500">Oct 24, 2023 - 14:32</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-[10px] font-bold rounded-lg uppercase">Completed</span>
                    </td>
                    <td className="py-4 font-mono text-sm text-white">+0.012 BTC</td>
                    <td className="py-4 text-right">
                       <button className="text-slate-500 hover:text-white"><ExternalLink size={14} /></button>
                    </td>
                  </tr>
                  <tr className="group">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <History size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Investment Return</p>
                          <p className="text-[10px] text-slate-500">Oct 20, 2023 - 09:15</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-[10px] font-bold rounded-lg uppercase">Completed</span>
                    </td>
                    <td className="py-4 font-mono text-sm text-white">+450.00 USDT</td>
                    <td className="py-4 text-right">
                       <button className="text-slate-500 hover:text-white"><ExternalLink size={14} /></button>
                    </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};
