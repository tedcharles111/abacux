
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { api } from '../services/api';
import { ArrowUpRight, ArrowDownLeft, Clock, Info, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [prices, setPrices] = useState(api.getCurrentPrices());
  const chartData = [
    { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 }, { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 2780 }, { name: 'Fri', value: 6890 }, { name: 'Sat', value: 6390 },
    { name: 'Sun', value: 7490 },
  ];

  useEffect(() => {
    const handlePriceUpdate = (e: any) => setPrices({ ...e.detail });
    window.addEventListener('market_price_update', handlePriceUpdate);
    return () => window.removeEventListener('market_price_update', handlePriceUpdate);
  }, []);

  const adminAdj = user.adminDisplayAdjustment;
  const showAdminAdj = adminAdj?.visible;

  // Calculate Real-time Balance
  const realBalance = (user.balance.btc * prices.btc) + (user.balance.eth * prices.eth) + user.balance.usdt + user.balance.usd;
  const displayBalanceValue = showAdminAdj ? adminAdj.amount : realBalance;
  const displayCurrency = showAdminAdj ? adminAdj.currency : 'USD';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user.fullName}</h1>
          <div className="flex items-center space-x-2 text-slate-400 mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-medium uppercase tracking-widest">Live Market Feed Active</span>
          </div>
        </div>
        {user.role !== UserRole.ADMIN && (
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={() => onNavigate('wallet')}>Deposit</Button>
            <Button size="sm" onClick={() => onNavigate('invest')}>New Investment</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} />
          </div>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Total Balance (Est.)</h3>
          <h2 className="text-3xl font-bold text-white transition-all">
            {displayCurrency === 'USD' || displayCurrency === 'USDT' ? '$' : ''}
            {displayBalanceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
          </h2>
          <div className="flex items-center mt-2 text-sm text-green-400">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+2.4% (24h)</span>
          </div>
        </Card>

        <Card title="Live Assets">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-xs">₿</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Bitcoin</p>
                  <p className="text-xs text-slate-500 font-mono">${prices.btc.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.balance.btc} BTC</p>
                <p className="text-xs text-slate-400">${(user.balance.btc * prices.btc).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">Ξ</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Ethereum</p>
                  <p className="text-xs text-slate-500 font-mono">${prices.eth.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.balance.eth} ETH</p>
                <p className="text-xs text-slate-400">${(user.balance.eth * prices.eth).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Market Summary">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Volume 24h</p>
                <p className="text-sm font-bold text-white">$1.2B</p>
             </div>
             <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Volatility</p>
                <p className="text-sm font-bold text-yellow-500">Medium</p>
             </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4" onClick={() => onNavigate('invest')}>Explore Markets</Button>
        </Card>
      </div>

      <Card title="Performance Analytics">
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: '#334155', opacity: 0.1}} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
