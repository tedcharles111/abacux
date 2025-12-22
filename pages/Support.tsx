
import React, { useState } from 'react';
/* Added CheckCircle to imports */
import { Mail, FileText, HelpCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button, Input } from '../components/ui';

export const Support: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Support Center</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Access our institutional knowledge base or connect with a specialist through our secure channels.</p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
           <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center hover:border-blue-500 transition-all cursor-pointer group shadow-xl">
             <Mail className="mx-auto text-blue-400 mb-6 group-hover:scale-110 transition-transform" size={48} />
             <h3 className="text-white font-black text-xl mb-2">Email Terminal</h3>
             <p className="text-sm text-slate-500 leading-relaxed">Direct encrypted communication with our specialist nodes. Response latency: &lt; 24h.</p>
           </div>
           <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center hover:border-blue-500 transition-all cursor-pointer group shadow-xl">
             <FileText className="mx-auto text-purple-400 mb-6 group-hover:scale-110 transition-transform" size={48} />
             <h3 className="text-white font-black text-xl mb-2">Technical Docs</h3>
             <p className="text-sm text-slate-500 leading-relaxed">Browse detailed guides on security, trading protocols, and API integrations.</p>
           </div>
        </div>

        {/* FAQ */}
        <div className="space-y-8 mb-20">
          <h2 className="text-2xl font-black text-white flex items-center">
            <HelpCircle className="mr-3 text-blue-500" /> Standard Protocols (FAQ)
          </h2>
          <div className="grid gap-4">
            {[
              { q: "Is AbacusX regulated?", a: "We operate in full compliance with global AML/KYC standards and hold multiple regional licenses." },
              { q: "How are my private keys managed?", a: "Keys are distributed via Multi-Party Computation (MPC) and never exist on a single machine." },
              { q: "What is the withdrawal cooldown?", a: "For security, new accounts have a 24h cooldown after the first successful KYC verification." }
            ].map((faq, idx) => (
              <details key={idx} className="bg-slate-900 rounded-2xl p-6 cursor-pointer group border border-slate-800 hover:border-slate-700 transition-colors">
                <summary className="font-bold text-white list-none flex justify-between items-center uppercase text-sm tracking-wide">
                  {faq.q}
                  <span className="text-slate-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck size={120} className="text-blue-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-8">Initiate Ticket</h2>
          {sent ? (
             <div className="bg-green-900/10 border border-green-800 text-green-400 p-8 rounded-2xl text-center animate-in zoom-in-95 duration-300">
               <CheckCircle className="mx-auto mb-4" size={48} />
               <p className="font-bold text-lg">Packet Successfully Transmitted</p>
               <p className="text-sm opacity-70 mt-2">A specialist will synchronize with you via email shortly.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                <Input placeholder="Full Name" />
                <Input placeholder="Node Email" type="email" />
              </div>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all font-bold">
                <option>General Inquiry</option>
                <option>Security / KYC Protocol</option>
                <option>Technical Infrastructure</option>
                <option>Institutional Partnership</option>
              </select>
              <textarea 
                rows={5} 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 font-medium"
                placeholder="Detailed description of your synchronization request..."
              ></textarea>
              <Button type="submit" className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs">Transmit Payload</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
