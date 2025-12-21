
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { api } from '../services/api';
import { User, InvestmentPlan } from '../types';
import { TrendingUp, Shield, Zap, Clock, Info, CheckCircle, Calculator, ChevronRight } from 'lucide-react';

interface InvestmentsProps {
  user: User;
}

export const Investments: React.FC<InvestmentsProps> = ({ user }) => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const data = await api.getPlans();
      // Supplement with a high-yield option for variety
      const extendedPlans: InvestmentPlan[] = [
        ...data,
        { 
          id: 'p3', 
          name: 'DeFi Degen Pool', 
          apr: 24.5, 
          durationDays: 180, 
          minDeposit: 2500, 
          // Casting the literal string to ensure it matches the InvestmentPlan.riskLevel union type
          riskLevel: 'HIGH' as 'LOW' | 'MEDIUM' | 'HIGH', 
          description: 'Maximized yields through algorithmic liquidity provision on emerging DEX protocols.' 
        }
      ];
      setPlans(extendedPlans);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Scanning market opportunities...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <TrendingUp size={14} className="mr-2" /> Yield Optimization
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Investment Terminal</h1>
          <p className="text-slate-400 mt-2">Deploy your capital into audited algorithmic strategies designed for consistent performance across market cycles.</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-4 rounded-2xl flex items-center space-x-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Total Value Locked</p>
            <p className="text-xl font-black text-white">$14.2M</p>
          </div>
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
            <Shield size={20} />
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] -m-1"></div>
            <Card className="h-full relative z-10 border-slate-800 bg-slate-900/40 backdrop-blur-xl rounded-[1.8rem] flex flex-col hover:border-blue-500/40 transition-all duration-500">
              <div className="p-2">
                <div className={`h-2 w-full rounded-full mb-6 ${
                  plan.riskLevel === 'LOW' ? 'bg-green-500/20' : 
                  plan.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                   <div className={`h-full rounded-full ${
                    plan.riskLevel === 'LOW' ? 'bg-green-500 w-1/3' : 
                    plan.riskLevel === 'MEDIUM' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'
                  }`}></div>
                </div>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <Badge status={plan.riskLevel} className="text-[10px] font-black tracking-widest" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-400">{plan.apr}%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">APR</div>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                {plan.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
                   <span className="text-slate-500 flex items-center"><Clock size={14} className="mr-2" /> Duration</span>
                   <span className="text-white font-bold">{plan.durationDays} Days</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/50">
                   <span className="text-slate-500 flex items-center"><Zap size={14} className="mr-2" /> Entry Min.</span>
                   <span className="text-white font-bold">${plan.minDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                   <span className="text-slate-500 flex items-center"><CheckCircle size={14} className="mr-2" /> Payout</span>
                   <span className="text-white font-bold">Daily Accrual</span>
                </div>
              </div>

              <Button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/10 hover:shadow-blue-600/30">
                Initiate Contract
              </Button>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Calculator */}
        <Card title="Projected Earnings Calculator" className="bg-slate-900/50 border-slate-800">
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Investment Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input type="number" defaultValue="5000" className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Target Strategy</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:border-blue-500 outline-none">
                    <option>Growth Alpha (12.0%)</option>
                    <option>Stable Saver (5.5%)</option>
                    <option>DeFi Degen (24.5%)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex items-center justify-between">
                 <div>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Estimated Return</p>
                    <h4 className="text-3xl font-black text-white">$600.00 <span className="text-sm font-medium text-slate-500">/ 90 Days</span></h4>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total at Maturity</p>
                    <p className="text-xl font-bold text-green-400">$5,600.00</p>
                 </div>
              </div>

              <p className="text-[10px] text-slate-600 leading-relaxed italic">
                * Projections are based on current APR and historical performance. Yields are accrued daily and credited to your primary wallet upon contract maturity.
              </p>
           </div>
        </Card>

        {/* Why Invest Section */}
        <div className="space-y-4">
           <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-[1.5rem] flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Capital Protection</h4>
                <p className="text-sm text-slate-400">Our Smart-Saver plans utilize institutional hedging to minimize downside risk during market volatility.</p>
              </div>
           </div>
           <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-[1.5rem] flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <Calculator size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Compound Growth</h4>
                <p className="text-sm text-slate-400">Automated re-investment triggers ensure your returns are constantly working to generate more value.</p>
              </div>
           </div>
           <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-[1.5rem] flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                <Info size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">24/7 Monitoring</h4>
                <p className="text-sm text-slate-400">Strategies are monitored by our risk-engine and human analysts around the clock.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Active Investments Placeholder */}
      <Card title="My Active Stakes">
         <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
               <TrendingUp size={24} className="text-slate-600" />
            </div>
            <h4 className="text-white font-bold mb-2">No active investments found</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">Start a new investment plan today to begin growing your digital asset portfolio.</p>
            <Button variant="outline" size="sm">Review Plan History</Button>
         </div>
      </Card>
    </div>
  );
};
