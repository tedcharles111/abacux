import React from 'react';
import { User } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { ArrowUpRight, ArrowDownLeft, Clock, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const chartData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 6890 },
    { name: 'Sat', value: 6390 },
    { name: 'Sun', value: 7490 },
  ];

  const adminAdj = user.adminDisplayAdjustment;
  const showAdminAdj = adminAdj?.visible;

  // Calculate Balance (Mock rates)
  const btcRate = 64230;
  const ethRate = 3450;
  const realBalance = (user.balance.btc * btcRate) + (user.balance.eth * ethRate) + user.balance.usdt + user.balance.usd;
  
  // Logic: Use admin adjustment if visible, otherwise real balance
  const displayBalanceValue = showAdminAdj ? adminAdj.amount : realBalance;
  const displayCurrency = showAdminAdj ? adminAdj.currency : 'USD';
  const isManipulated = showAdminAdj;

  return (
    <div className="space-y-6">
      {/* Welcome & KYC Alert */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user.fullName}</h1>
          <p className="text-slate-400">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={() => onNavigate('wallet')}>Deposit</Button>
          <Button size="sm" onClick={() => onNavigate('invest')}>New Investment</Button>
        </div>
      </div>

      {user.kycStatus !== 'VERIFIED' && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start space-x-3">
          <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-100">Verify your identity</h4>
            <p className="text-sm text-blue-300 mt-1">
              To unlock full withdrawals and higher limits, please complete your KYC verification.
            </p>
            <button onClick={() => onNavigate('kyc')} className="text-sm font-semibold text-blue-400 hover:text-blue-300 mt-2">
              Complete Verification &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Admin Adjustment Banner - Optional Extra Visibility */}
      {showAdminAdj && adminAdj.type === 'cosmetic' && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900 to-purple-900 p-6 shadow-lg border border-indigo-700/50">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                 <span className="px-2 py-1 text-xs font-bold text-white bg-indigo-500/30 rounded uppercase tracking-wider">
                   Action Required
                 </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Account Update
              </h3>
              <p className="text-indigo-200 text-sm flex items-center mt-1">
                 <Info size={14} className="mr-1"/> {adminAdj.reason}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white">{adminAdj.currency} {adminAdj.amount.toLocaleString()}</span>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Balance (Est.)">
          <div className="mt-2">
            <h2 className="text-3xl font-bold text-white">
              {displayCurrency === 'USD' || displayCurrency === 'USDT' ? '$' : ''}
              {displayBalanceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
              {displayCurrency !== 'USD' && displayCurrency !== 'USDT' ? ` ${displayCurrency}` : ''}
            </h2>
            <div className="flex items-center mt-2 text-sm text-green-400">
              <ArrowUpRight size={16} className="mr-1" />
              <span>+2.4% (24h)</span>
            </div>
          </div>
        </Card>

        <Card title="Holdings">
          <div className="space-y-4 mt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-xs">₿</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Bitcoin</p>
                  <p className="text-xs text-slate-500">BTC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.balance.btc} BTC</p>
                <p className="text-xs text-slate-500">${(user.balance.btc * btcRate).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">$</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Tether</p>
                  <p className="text-xs text-slate-500">USDT</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.balance.usdt.toLocaleString()} USDT</p>
                <p className="text-xs text-slate-500">$1.00</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Active Plans">
          <div className="mt-2 flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
             <div>
               <p className="text-white font-medium">Growth Alpha</p>
               <p className="text-xs text-slate-500">Ends in 12 days</p>
             </div>
             <div className="text-right">
               <p className="text-green-400 font-bold">+12.5%</p>
               <p className="text-xs text-slate-500">APR</p>
             </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4" onClick={() => onNavigate('invest')}>View All Plans</Button>
        </Card>
      </div>

      {/* Chart Section */}
      <Card title="Portfolio Performance">
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                cursor={{fill: '#334155', opacity: 0.2}}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#6366f1' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Recent Activity */}
      <Card title="Recent Transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="px-4 py-3"><span className="text-white">Deposit</span></td>
                <td className="px-4 py-3 text-slate-400">BTC</td>
                <td className="px-4 py-3 text-green-400">+0.05</td>
                <td className="px-4 py-3 text-slate-400">Feb 01, 2024</td>
                <td className="px-4 py-3"><Badge status="COMPLETED" /></td>
              </tr>
              <tr>
                <td className="px-4 py-3"><span className="text-white">Investment</span></td>
                <td className="px-4 py-3 text-slate-400">USDT</td>
                <td className="px-4 py-3 text-slate-300">-1000.00</td>
                <td className="px-4 py-3 text-slate-400">Feb 05, 2024</td>
                <td className="px-4 py-3"><Badge status="ACTIVE" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};