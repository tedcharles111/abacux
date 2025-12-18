import React, { useState } from 'react';
import { Mail, MessageCircle, FileText } from 'lucide-react';
import { Button, Input } from '../components/ui';

export const Support: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const triggerLiveChat = () => {
    const event = new CustomEvent('open-live-chat');
    window.dispatchEvent(event);
  };

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white text-center mb-4">How can we help?</h1>
        <p className="text-slate-400 text-center mb-12">Search our knowledge base or get in touch with our team.</p>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
           <div 
             onClick={triggerLiveChat}
             className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center hover:border-blue-500 transition-colors cursor-pointer group"
           >
             <MessageCircle className="mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
             <h3 className="text-white font-bold">Live Chat</h3>
             <p className="text-sm text-slate-500 mt-2">Available 24/7</p>
           </div>
           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center hover:border-blue-500 transition-colors cursor-pointer group">
             <Mail className="mx-auto text-purple-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
             <h3 className="text-white font-bold">Email Us</h3>
             <p className="text-sm text-slate-500 mt-2">Response in 24h</p>
           </div>
           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center hover:border-blue-500 transition-colors cursor-pointer group">
             <FileText className="mx-auto text-green-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
             <h3 className="text-white font-bold">Docs</h3>
             <p className="text-sm text-slate-500 mt-2">Read guides</p>
           </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6 mb-16">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-slate-900 rounded-lg p-4 cursor-pointer group">
              <summary className="font-medium text-white list-none flex justify-between items-center">
                Is AbacusX safe?
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400">Yes, we use cold storage for 98% of assets and have a comprehensive insurance policy.</p>
            </details>
            <details className="bg-slate-900 rounded-lg p-4 cursor-pointer group">
              <summary className="font-medium text-white list-none flex justify-between items-center">
                What are the trading fees?
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400">Our fees start at 0.1% for takers and 0.05% for makers, decreasing with volume.</p>
            </details>
            <details className="bg-slate-900 rounded-lg p-4 cursor-pointer group">
              <summary className="font-medium text-white list-none flex justify-between items-center">
                How do I verify my identity?
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400">Go to Settings &gt; Identity Verification and upload your government ID.</p>
            </details>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
          {sent ? (
             <div className="bg-green-900/20 border border-green-800 text-green-400 p-4 rounded-lg text-center">
               Message sent successfully! We will get back to you shortly.
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Your Name" />
                <Input placeholder="Email Address" type="email" />
              </div>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none">
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership</option>
              </select>
              <textarea 
                rows={4} 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                placeholder="Describe your issue..."
              ></textarea>
              <Button type="submit" className="w-full">Submit Request</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};