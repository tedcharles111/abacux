import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Shield, Zap, TrendingUp, ChevronLeft, Star, ArrowRight, 
  Smartphone, Globe, Lock, CheckCircle, Award, Users, Server, Eye 
} from 'lucide-react';

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

      {/* NEW: Platform Stats Section */}
      <section className="bg-slate-900 py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
             <div className="p-4">
               <p className="text-4xl font-bold text-white mb-2">$500M+</p>
               <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Quarterly Volume</p>
             </div>
             <div className="p-4">
               <p className="text-4xl font-bold text-white mb-2">120K+</p>
               <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Verified Users</p>
             </div>
             <div className="p-4">
               <p className="text-4xl font-bold text-white mb-2">150+</p>
               <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Countries Supported</p>
             </div>
             <div className="p-4">
               <p className="text-4xl font-bold text-white mb-2">99.99%</p>
               <p className="text-slate-500 uppercase text-xs font-bold tracking-wider">Uptime Record</p>
             </div>
           </div>
        </div>
      </section>

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
            {/* Arrows */}
            <div className="flex space-x-4">
               <button onClick={prevPlan} className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 text-white transition-colors" aria-label="Previous Plan">
                 <ChevronLeft size={24} />
               </button>
               <button onClick={nextPlan} className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 text-white transition-colors" aria-label="Next Plan">
                 <ChevronRight size={24} />
               </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
               {[0, 1, 2].map((offset) => {
                 const index = (activePlanIndex + offset) % INVESTMENT_PLANS.length;
                 const plan = INVESTMENT_PLANS[index];
                 return (
                    <div key={plan.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 h-full flex flex-col transform duration-500">
                      <div className="h-48 overflow-hidden relative flex-shrink-0">
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
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-xl">{plan.apy}</p>
                            <p className="text-xs text-slate-500">APY</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 flex-grow">{plan.desc}</p>
                        <button onClick={() => onNavigate('signup')} className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors mt-auto">
                          View Details
                        </button>
                      </div>
                    </div>
                 );
               })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {INVESTMENT_PLANS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActivePlanIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activePlanIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to plan ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* NEW: How It Works Section */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Earning in Minutes</h2>
             <p className="text-slate-400">Our seamless onboarding process gets you invested quickly and securely.</p>
           </div>
           
           <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>

              {[
                { title: "Create Account", desc: "Sign up with your email and set a secure password.", icon: Users },
                { title: "Verify Identity", desc: "Complete our swift automated KYC process.", icon: CheckCircle },
                { title: "Deposit Funds", desc: "Add Crypto or Fiat via card or bank transfer.", icon: ArrowRight },
                { title: "Start Investing", desc: "Choose a plan and watch your portfolio grow.", icon: TrendingUp },
              ].map((step, idx) => (
                <div key={idx} className="relative pt-4 text-center group">
                   <div className="w-16 h-16 mx-auto bg-slate-950 border-2 border-blue-600 rounded-full flex items-center justify-center text-white mb-6 z-10 relative shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform duration-300">
                     <step.icon size={28} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                   <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose AbacusX?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden bg-slate-900 p-8 rounded-2xl border border-slate-800 group hover:border-blue-500/30 transition-colors">
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

            <div className="relative overflow-hidden bg-slate-900 p-8 rounded-2xl border border-slate-800 group hover:border-purple-500/30 transition-colors">
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

            <div className="relative overflow-hidden bg-slate-900 p-8 rounded-2xl border border-slate-800 group hover:border-green-500/30 transition-colors">
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

      {/* NEW: Mobile App Section */}
      <section className="py-24 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="order-2 md:order-1 relative">
                {/* Abstract Phone Mockup */}
                <div className="relative mx-auto w-[300px] h-[600px] bg-slate-950 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden animate-float">
                   <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                   <div className="w-full h-full bg-slate-900 p-6 flex flex-col relative">
                      {/* Fake App UI */}
                      <div className="flex justify-between items-center mb-8 mt-8">
                         <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                         <div className="w-4 h-4 rounded-full bg-slate-700"></div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">$42,391</div>
                      <div className="text-green-400 text-sm mb-8">+12.4% this week</div>
                      <div className="h-32 bg-gradient-to-t from-blue-500/20 to-transparent rounded-xl border-b border-blue-500 relative mb-6">
                         <div className="absolute bottom-0 w-full h-1/2 border-t-2 border-blue-500/50 transform skew-y-6"></div>
                      </div>
                      <div className="space-y-4">
                         <div className="h-12 bg-slate-800 rounded-xl w-full"></div>
                         <div className="h-12 bg-slate-800 rounded-xl w-full"></div>
                         <div className="h-12 bg-slate-800 rounded-xl w-full"></div>
                      </div>
                      <div className="mt-auto bg-blue-600 w-full py-3 rounded-xl text-center text-white text-sm font-bold shadow-lg shadow-blue-600/30">Buy Bitcoin</div>
                   </div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"></div>
             </div>
             
             <div className="order-1 md:order-2">
               <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-sm font-medium mb-6 border border-blue-500/30">
                 <Smartphone size={16} className="mr-2" />
                 <span>Mobile App</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Trade anywhere, anytime.</h2>
               <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                 Stay connected to the market with our powerful mobile app. Real-time alerts, instant deposits, and portfolio management in your pocket.
               </p>
               
               <div className="space-y-4 mb-8">
                 <div className="flex items-center text-slate-300">
                    <CheckCircle className="text-green-500 mr-3" size={20} />
                    <span>Biometric Authentication</span>
                 </div>
                 <div className="flex items-center text-slate-300">
                    <CheckCircle className="text-green-500 mr-3" size={20} />
                    <span>Custom Price Alerts</span>
                 </div>
                 <div className="flex items-center text-slate-300">
                    <CheckCircle className="text-green-500 mr-3" size={20} />
                    <span>24/7 Chat Support</span>
                 </div>
               </div>

               <div className="flex flex-wrap gap-4">
                 <button className="flex items-center px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    <span className="text-xl mr-2"></span> App Store
                 </button>
                 <button className="flex items-center px-6 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                    <span className="text-xl mr-2">▶</span> Google Play
                 </button>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* NEW: Security Deep Dive */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div>
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Fort Knox of Crypto</h2>
               <p className="text-slate-400 mb-8 leading-relaxed">
                 We don't just facilitate trades; we protect your future. Our security infrastructure is designed by world-class cybersecurity experts and audited by top firms.
               </p>
               
               <div className="grid grid-cols-1 gap-6">
                 <div className="flex items-start">
                   <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mr-4">
                     <Lock className="text-blue-400" size={24} />
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-lg">Cold Storage</h4>
                     <p className="text-slate-500 text-sm mt-1">98% of all digital assets are stored offline in geographically distributed vaults.</p>
                   </div>
                 </div>
                 <div className="flex items-start">
                   <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mr-4">
                     <Eye className="text-purple-400" size={24} />
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-lg">Proof of Reserves</h4>
                     <p className="text-slate-500 text-sm mt-1">Verify our solvency anytime on the blockchain. We maintain 1:1 reserves for all user funds.</p>
                   </div>
                 </div>
                 <div className="flex items-start">
                   <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mr-4">
                     <Server className="text-green-400" size={24} />
                   </div>
                   <div>
                     <h4 className="text-white font-bold text-lg">Infrastructure</h4>
                     <p className="text-slate-500 text-sm mt-1">Hosted on distributed, redundant servers with DDoS protection and real-time threat monitoring.</p>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                   <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Award className="text-yellow-500 mr-2"/> Certifications</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                        <div className="font-mono text-2xl font-bold text-slate-300">SOC2</div>
                        <div className="text-xs text-slate-500 mt-1">Type II Certified</div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                        <div className="font-mono text-2xl font-bold text-slate-300">ISO</div>
                        <div className="text-xs text-slate-500 mt-1">27001 Standard</div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                        <div className="font-mono text-2xl font-bold text-slate-300">CCSS</div>
                        <div className="text-xs text-slate-500 mt-1">Level 3 Security</div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                        <div className="font-mono text-2xl font-bold text-slate-300">GDPR</div>
                        <div className="text-xs text-slate-500 mt-1">Compliant</div>
                      </div>
                   </div>
                   <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                      <p className="text-slate-400 text-sm">Audited by</p>
                      <div className="flex justify-center space-x-6 mt-3 text-slate-500 font-bold opacity-60">
                        <span>DELOITTE</span>
                        <span>KPMG</span>
                      </div>
                   </div>
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

      {/* NEW: Partners Section */}
      <section className="py-12 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-8">Backed by Industry Leaders</p>
           <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <span className="text-2xl font-bold text-white font-serif">SEQUOIA</span>
              <span className="text-2xl font-bold text-white tracking-tighter">COINBASE</span>
              <span className="text-2xl font-bold text-white italic">Pantera</span>
              <span className="text-2xl font-bold text-white font-mono">a16z</span>
              <span className="text-2xl font-bold text-white">BINANCE <span className="text-yellow-500">LABS</span></span>
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