import React from 'react';
import { Target, Users, Lock, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Democratizing Financial Freedom</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            At AbacusX, we believe that professional-grade financial tools should be accessible to everyone, not just Wall Street.
          </p>
        </div>

        {/* Our Goal */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <div className="inline-flex items-center space-x-2 text-blue-400 font-bold uppercase tracking-wider mb-4">
              <Target size={20} />
              <span>Our Goal</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Building the Trust Layer of the Internet</h2>
            <div className="space-y-4 text-slate-400">
              <p>
                The crypto industry has been plagued by opacity and security failures. Our goal is to set a new standard for transparency and reliability.
              </p>
              <p>
                We are building a platform where integrity is baked into the code. Where users don't have to trust us blindly, but can verify our solvency and security practices. We aim to onboard the next billion users into the digital economy by making it safe, simple, and compliant.
              </p>
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-500">
             <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-slate-700 font-bold text-6xl">Vision</span>
             </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8">
           <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
             <Lock className="text-blue-400 mb-4" size={32} />
             <h3 className="text-xl font-bold text-white mb-2">Security First</h3>
             <p className="text-slate-400">We don't cut corners. If it's not secure, we don't build it.</p>
           </div>
           <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
             <Users className="text-purple-400 mb-4" size={32} />
             <h3 className="text-xl font-bold text-white mb-2">User Obsessed</h3>
             <p className="text-slate-400">Every feature is designed to solve real user problems, not just hype.</p>
           </div>
           <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50">
             <Globe className="text-green-400 mb-4" size={32} />
             <h3 className="text-xl font-bold text-white mb-2">Global Access</h3>
             <p className="text-slate-400">Financial borders are a thing of the past. We serve the world.</p>
           </div>
        </div>

      </div>
    </div>
  );
};