import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Zap, TrendingUp, ChevronLeft, Star, ArrowRight } from 'lucide-react';

// Investment Plans Data for Carousel
const INVESTMENT_PLANS = [
  {
    id: 1,
    name: "Stable Saver",
    apy: "5.5%",
    desc: "Low-risk yield farming on USDT/USDC stablecoins.",
    image: "https://images.unsplash.com/photo-1621501103258-0e1d5c210204?q=80&w=600&auto=format&fit=crop",
    min: "$100"
  },
  {
    id: 2,
    name: "Growth Alpha",
    apy: "12.0%",
    desc: "Balanced portfolio rebalancing across top 10 assets.",
    image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=600&auto=format&fit=crop",
    min: "$500"
  },
  {
    id: 3,
    name: "DeFi Degen",
    apy: "25.0%",
    desc: "High-yield liquidity provision in emerging protocols.",
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fddadb3?q=80&w=600&auto=format&fit=crop",
    min: "$1,000"
  },
  {
    id: 4,
    name: "Bitcoin Maxi",
    apy: "8.5%",
    desc: "Accumulate BTC through automated swing trading.",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=600&auto=format&fit=crop",
    min: "$250"
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Early Investor",
    quote: "AbacusX simplified my crypto journey. The automated plans are a game changer.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Michael Chang",
    role: "Day Trader",
    quote: "The execution speed is unmatched. I've never experienced slippage on this platform.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "HODLer",
    quote: "Finally, a platform that puts security first. I sleep better knowing my assets are cold-stored.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
  }
];

export const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  // Carousel State
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextPlan = () => {
    setActivePlanIndex((prev) => (prev + 1) % INVESTMENT_PLANS.length);
  };

  const prevPlan = () => {
    setActivePlanIndex((prev) => (prev - 1 + INVESTMENT_PLANS.length) % INVESTMENT_PLANS.length);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-slate-950 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/10 blur-[100px] rounded-full transform translate-x-1/4 -translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-left space-y-8">
              <div className="inline-flex items-center space-x-2 bg-slate-900/50 border border-slate-700 rounded-full px-4 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Live Market Data</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                Master the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">
                  Crypto Economy
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                Experience institutional-grade investing. Real-time analytics, automated strategies, and cold-storage security in one powerful platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('signup')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center group"
                >
                  Start Investing <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button 
                  onClick={() => onNavigate('about')}
                  className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm"
                >
                  View Market
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center"><Shield size={16} className="mr-2 text-green-500"/> SOC2 Certified</span>
                <span className="flex items-center"><Shield size={16} className="mr-2 text-green-500"/> $100M Insurance</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[2.5rem] transform rotate-3 blur-2xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1642751227563-7c1b5318581e?q=80&w=1200&auto=format&fit=crop" 
                alt="Crypto Dashboard App" 
                className="relative z-10 rounded-[2rem] shadow-2xl border border-slate-700/50 w-full object-cover h-[600px] hover:scale-[1.01] transition-transform duration-500"
              />
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-700 shadow-xl z-20 animate-bounce-slow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 font-bold">₿</div>
                  <div>
                    <p className="text-white font-bold">Bitcoin</p>
                    <p className="text-green-400 text-sm">+5.24%</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-slate-700 shadow-xl z-20 animate-bounce-slow delay-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-bold">Ξ</div>
                  <div>
                    <p className="text-white font-bold">Ethereum</p>
                    <p className="text-green-400 text-sm">+3.12%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Strip */}
      <div className="bg-slate-900 border-y border-slate-800 py-4 overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap min-w-full justify-center opacity-80">
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
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">BNB</span>
            <span className="text-green-400">+1.2%</span>
            <span className="text-slate-400">$590.50</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">XRP</span>
            <span className="text-green-400">+0.8%</span>
            <span className="text-slate-400">$0.62</span>
          </div>
        </div>
      </div>

      {/* Investment Plans Carousel Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Curated Investment Strategies</h2>
              <p className="text-slate-400 max-w-xl">
                Choose from our selection of AI-optimized portfolios designed for every risk appetite.
              </p>
            </div>
            <div className="flex space-x-4">
               <button onClick={prevPlan} className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 text-white transition-colors">
                 <ChevronLeft size={24} />
               </button>
               <button onClick={nextPlan} className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 text-white transition-colors">
                 <ChevronRight size={24} />
               </button>
            </div>
          </div>

          {/* Carousel Viewport */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${activePlanIndex * 100}%)` }} // Simple translation for demo (on mobile this slides 100%, usually you'd calculate width)
            >
              {/* Note: For a robust responsive carousel, we'd calculate widths. This is a simplified view showing one at a time on mobile or grid on desktop if not sliding. 
                  Let's make it a grid that highlights one, or actually implement a visual slider for desktop.
                  For this demo, we will render a grid of 3 visible items based on index.
              */}
            </div>
            
            {/* Desktop Grid / Mobile Stack (Simplified for visual consistency without complex js math) */}
            <div className="grid md:grid-cols-3 gap-8">
               {/* We show 3 items starting from activePlanIndex, wrapping around */}
               {[0, 1, 2].map((offset) => {
                 const index = (activePlanIndex + offset) % INVESTMENT_PLANS.length;
                 const plan = INVESTMENT_PLANS[index];
                 return (
                    <div key={plan.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10">
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={plan.image} 
                          alt={plan.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                           <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                             {plan.min} MIN
                           </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-xl">{plan.apy}</p>
                            <p className="text-xs text-slate-500">APY</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.desc}</p>
                        <button onClick={() => onNavigate('signup')} className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                 );
               })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with Background Images */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose AbacusX?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden bg-slate-900 p-8 rounded-2xl border border-slate-800 group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=600')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400 mb-6 border border-blue-500/30">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
                <p className="text-slate-400 leading-relaxed">
                  98% of assets held in cold storage. Mandatory 2FA and real-time anomaly detection.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-slate-900 p-8 rounded-2xl border border-slate-800 group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-ad7117a39434?q=80&w=600')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-400 mb-6 border border-purple-500/30">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Yields</h3>
                <p className="text-slate-400 leading-relaxed">
                  Earn up to 12% APY on your idle assets with our automated staking pools.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-slate-900 p-8 rounded-2xl border border-slate-800 group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center text-green-400 mb-6 border border-green-500/30">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Lightning Execution</h3>
                <p className="text-slate-400 leading-relaxed">
                  Our matching engine handles 100k TPS with zero downtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Trusted by 100,000+ Investors</h2>
          
          <div className="relative bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-slate-700 backdrop-blur-sm">
            {/* Quote Icon */}
            <div className="absolute top-8 left-8 text-blue-500/20">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.896 14.913 16 16.017 16H19.017C19.569 16 20.017 15.552 20.017 15V9C20.017 8.448 19.569 8 19.017 8H15.017C14.465 8 14.017 7.552 14.017 7V3H19.017C20.674 3 22.017 4.343 22.017 6V15C22.017 16.657 20.674 18 19.017 18H16.017C15.465 18 15.017 18.448 15.017 19V21H14.017ZM5.01699 21L5.01699 18C5.01699 16.896 5.913 16 7.01699 16H10.017C10.569 16 11.017 15.552 11.017 15V9C11.017 8.448 10.569 8 10.017 8H6.01699C5.46499 8 5.01699 7.552 5.01699 7V3H10.017C11.674 3 13.017 4.343 13.017 6V15C13.017 16.657 11.674 18 10.017 18H7.01699C6.46499 18 6.01699 18.448 6.01699 19V21H5.01699Z"></path></svg>
            </div>

            <div className="relative z-10 transition-opacity duration-500">
               <img 
                 src={TESTIMONIALS[activeTestimonialIndex].image} 
                 alt={TESTIMONIALS[activeTestimonialIndex].name}
                 className="w-20 h-20 rounded-full mx-auto mb-6 border-2 border-blue-500 object-cover"
               />
               <p className="text-xl md:text-2xl text-white font-medium italic mb-6 leading-relaxed">
                 "{TESTIMONIALS[activeTestimonialIndex].quote}"
               </p>
               <div>
                 <p className="text-white font-bold">{TESTIMONIALS[activeTestimonialIndex].name}</p>
                 <p className="text-blue-400 text-sm">{TESTIMONIALS[activeTestimonialIndex].role}</p>
               </div>
               
               <div className="flex justify-center gap-1 mt-6">
                 {[0, 1, 2].map((i) => (
                   <div 
                     key={i} 
                     className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonialIndex ? 'w-8 bg-blue-500' : 'w-2 bg-slate-600'}`}
                   ></div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to start your journey?</h2>
          <p className="text-slate-300 mb-8 text-lg">Join thousands of investors who trust AbacusX with their financial future.</p>
          <button 
             onClick={() => onNavigate('signup')}
             className="px-10 py-4 bg-white text-blue-900 font-bold rounded-full hover:bg-slate-100 transition-colors shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200"
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};