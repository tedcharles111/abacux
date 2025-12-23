
import React from 'react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "border border-slate-600 text-slate-300 hover:bg-slate-800 focus:ring-slate-500",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2 w-10 h-10"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>
      )}
      <input 
        className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg ${icon ? 'pl-10' : 'px-4'} py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors ${className}`}
        {...props} 
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

// Badge
export const Badge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  let colorClass = "bg-slate-700 text-slate-300";
  const s = status.toUpperCase();
  
  if (s === 'VERIFIED' || s === 'COMPLETED' || s === 'ACTIVE') colorClass = "bg-green-900/50 text-green-400 border border-green-800";
  if (s === 'PENDING') colorClass = "bg-yellow-900/50 text-yellow-400 border border-yellow-800";
  if (s === 'REJECTED' || s === 'FAILED' || s === 'HIGH') colorClass = "bg-red-900/50 text-red-400 border border-red-800";
  if (s === 'ADMIN') colorClass = "bg-purple-900/50 text-purple-400 border border-purple-800";
  if (s === 'MEDIUM') colorClass = "bg-yellow-900/50 text-yellow-400 border border-yellow-800";
  if (s === 'LOW') colorClass = "bg-green-900/50 text-green-400 border border-green-800";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {status}
    </span>
  );
};

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
