import React, { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, onNavigate, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About & Goals' },
    { id: 'support', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-300">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => onNavigate('home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-blue-500/20">
                A
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">AbacusX</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    currentPage === link.id ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('login')}
                className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate('signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-800 mt-4 flex flex-col space-y-3">
                <button 
                  onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                  className="w-full px-3 py-3 rounded-lg text-center font-medium text-slate-300 hover:bg-slate-800"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                  className="w-full px-3 py-3 rounded-lg text-center font-bold bg-blue-600 text-white"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold text-white">AbacusX</span>
              <p className="mt-4 text-sm text-slate-500">
                The next generation of secure, intelligent crypto asset management.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button className="hover:text-blue-400">Markets</button></li>
                <li><button className="hover:text-blue-400">Exchange</button></li>
                <li><button className="hover:text-blue-400">Earn</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => onNavigate('support')} className="hover:text-blue-400">Help Center</button></li>
                <li><button className="hover:text-blue-400">API Documentation</button></li>
                <li><button className="hover:text-blue-400">Fees</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => onNavigate('about')} className="hover:text-blue-400">About Us</button></li>
                <li><button className="hover:text-blue-400">Careers</button></li>
                <li><button className="hover:text-blue-400">Legal</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
            <p>&copy; 2024 AbacusX Financial. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};