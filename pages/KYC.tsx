
import React, { useState } from 'react';
import { User, KYCStatus } from '../types';
import { Card, Button, Input, Badge } from '../components/ui';
import { api } from '../services/api';
import { ShieldCheck, Smartphone, MapPin, Mail, Camera, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface KYCProps {
  user: User;
}

export const KYC: React.FC<KYCProps> = ({ user }) => {
  const [status, setStatus] = useState<KYCStatus>(user.kycStatus);
  const [loading, setLoading] = useState(false);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    email: user.email,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassportFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay for compliance check
    setTimeout(async () => {
      const success = await api.submitKYC(user.id, { ...formData, passport: passportFile?.name });
      if (success) {
        setStatus(KYCStatus.PENDING);
        // Dispatch event so other components (like App/Layout) know status changed if they listen
        window.dispatchEvent(new CustomEvent('user_status_update', { detail: KYCStatus.PENDING }));
      }
      setLoading(false);
    }, 1500);
  };

  if (status === KYCStatus.VERIFIED) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Identity Verified</h1>
        <p className="text-slate-400 mb-8">Your account is fully compliant. All withdrawal limits have been lifted and premium investment plans are now unlocked.</p>
        <Card className="bg-slate-900/50 border-green-500/20">
           <div className="flex items-center space-x-4 text-left">
              <div className="p-3 bg-slate-800 rounded-xl">
                 <ShieldCheck className="text-blue-400" />
              </div>
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Verification Level</p>
                 <p className="text-white font-bold">Tier 3 (Institutional)</p>
              </div>
           </div>
        </Card>
      </div>
    );
  }

  if (status === KYCStatus.PENDING) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 size={40} className="animate-spin" />
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Verification Pending</h1>
        <p className="text-slate-400 mb-8">Our compliance team is currently reviewing your documents. This typically takes 2-4 hours. You will receive an email notification once approved.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Card className="text-left bg-slate-900/50">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Submitted On</p>
              <p className="text-white font-bold">{new Date().toLocaleDateString()}</p>
           </Card>
           <Card className="text-left bg-slate-900/50">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Estimated Completion</p>
              <p className="text-white font-bold">Today, ~18:00 UTC</p>
           </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center">
          <ShieldCheck className="mr-3 text-blue-500" size={32} /> Identity Verification
        </h1>
        <p className="text-slate-400 mt-2">To comply with global financial regulations (AML/KYC), please complete your identity profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Personal Details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Email Address" 
                    value={formData.email} 
                    disabled 
                    className="opacity-60 bg-slate-800"
                    icon={<Mail size={16} />}
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="+1 (555) 000-0000" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    icon={<Smartphone size={16} />}
                  />
                </div>
                <Input 
                  label="Residential Address" 
                  placeholder="Full street address, City, Postal Code" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  icon={<MapPin size={16} />}
                />
              </div>
            </Card>

            <Card title="Document Upload">
              <div className="space-y-6">
                <p className="text-sm text-slate-400">Please provide a clear color photo of your Passport or National ID card. All four corners must be visible.</p>
                
                <div className="relative group">
                  <input 
                    type="file" 
                    id="passport-upload" 
                    className="hidden" 
                    accept="image/*,.pdf" 
                    onChange={handleFileChange}
                    required
                  />
                  <label 
                    htmlFor="passport-upload" 
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                      passportFile ? 'border-green-500 bg-green-500/5' : 'border-slate-700 bg-slate-900/50 hover:border-blue-500 hover:bg-blue-500/5'
                    }`}
                  >
                    {passportFile ? (
                      <>
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle size={32} />
                        </div>
                        <p className="text-white font-bold">{passportFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:text-blue-400 transition-colors">
                          <Camera size={32} />
                        </div>
                        <p className="text-white font-bold">Upload Passport / ID</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl flex items-start space-x-3">
                  <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-200/80 leading-relaxed">
                    By clicking submit, you authorize AbacusX to verify your identity through our audited 3rd party compliance partners. Your data is encrypted and never sold.
                  </p>
                </div>

                <Button type="submit" className="w-full py-4" isLoading={loading}>
                  Submit For Verification
                </Button>
              </div>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
          <Card title="Verification Progress">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                         <CheckCircle size={16} />
                      </div>
                      <span className="text-sm text-slate-300">Email Verified</span>
                   </div>
                   <Badge status="Done" className="bg-green-500/10 text-green-500" />
                </div>
                <div className="flex items-center justify-between opacity-50">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                         <FileText size={16} />
                      </div>
                      <span className="text-sm text-slate-300">ID Authentication</span>
                   </div>
                   <Badge status="Next" />
                </div>
                <div className="flex items-center justify-between opacity-50">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                         <ShieldCheck size={16} />
                      </div>
                      <span className="text-sm text-slate-300">Compliance Audit</span>
                   </div>
                   <Badge status="Waiting" />
                </div>
             </div>
          </Card>

          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6">
             <h4 className="text-white font-bold mb-2 flex items-center">
               <ShieldCheck className="text-indigo-400 mr-2" size={18} /> Why verify?
             </h4>
             <ul className="text-xs text-slate-400 space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span> 
                  Unlock withdrawals up to $50,000 daily.
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span> 
                  Access high-yield DeFi Degen pools.
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span> 
                  Enhanced account recovery protection.
                </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
