import React from 'react';
import { ChevronRight, Shield, Zap, Globe, TrendingUp, Lock } from 'lucide-react';

export const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-900/30 border border-blue-800 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
            <span className="text-sm font-medium text-blue-200">AbacusX V2 is live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
            Invest in the Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Digital Finance</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10">
            Securely buy, sell, and manage your crypto portfolio with enterprise-grade security and AI-driven investment insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center"
            >
              Start Investing <ChevronRight className="ml-2" size={20} />
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold text-lg transition-all"
            >
              Learn More
            </button>
          </div>
          
          {/* Trust Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-8">
            <div>
              <p className="text-3xl font-bold text-white">$2B+</p>
              <p className="text-sm text-slate-500">Quarterly Volume</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">100K+</p>
              <p className="text-sm text-slate-500">Verified Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">&lt;50ms</p>
              <p className="text-sm text-slate-500">Latency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">0%</p>
              <p className="text-sm text-slate-500">Security Breaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Strip (Static Mock) */}
      <div className="bg-slate-900 border-y border-slate-800 py-3 overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap min-w-full justify-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">BTC</span>
            <span className="text-green-400">+2.4%</span>
            <span className="text-slate-400">$64,230.12</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">ETH</span>
            <span className="text-red-400">-0.5%</span>
            <span className="text-slate-400">$3,450.00</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">SOL</span>
            <span className="text-green-400">+5.2%</span>
            <span className="text-slate-400">$145.20</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">USDT</span>
            <span className="text-slate-400">0.0%</span>
            <span className="text-slate-400">$1.00</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose AbacusX?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We combine traditional financial rigor with blockchain innovation to provide the safest and most efficient trading platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
              <p className="text-slate-400 leading-relaxed">
                98% of assets held in cold storage. Mandatory 2FA and real-time anomaly detection systems protect your funds 24/7.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Yields</h3>
              <p className="text-slate-400 leading-relaxed">
                Earn up to 12% APY on your idle assets with our automated staking and lending pools, optimized for risk-adjusted returns.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Execution</h3>
              <p className="text-slate-400 leading-relaxed">
                Our matching engine handles 100,000 transactions per second with zero downtime, ensuring you never miss a market move.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to start your journey?</h2>
          <p className="text-slate-300 mb-8 text-lg">Join thousands of investors who trust AbacusX with their financial future.</p>
          <button 
             onClick={() => onNavigate('signup')}
             className="px-8 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-slate-100 transition-colors"
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};