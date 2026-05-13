import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}) {
  const variants = {
    primary: 'bg-sport-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20',
    secondary: 'bg-dark-surface text-gray-100 hover:bg-gray-800 border border-gray-800',
    outline: 'bg-transparent border border-gray-700 text-gray-300 hover:border-neon hover:text-neon',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/30',
    neon: 'bg-neon text-black hover:bg-[#d4e93e] font-bold shadow-lg shadow-neon/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider font-display',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('bg-dark-surface border border-white/5 rounded-xl overflow-hidden shadow-xl', className)} 
      {...props}
    >
      {children}
    </div>
  );
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-xl font-display uppercase text-white">{title}</h3>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Input({ className, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <input 
        className={cn(
          'w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all',
          className
        )}
        onFocus={(e) => {
          if (props.type === 'number') e.target.select();
          props.onFocus?.(e);
        }}
        {...props}
      />
    </div>
  );
}

export function Badge({ 
  children, 
  className, 
  variant = 'default',
  ...props
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'neon' | 'orange' | 'red' | 'gray';
} & React.HTMLAttributes<HTMLSpanElement>) {
  const variants = {
    default: 'bg-white/10 text-gray-300',
    neon: 'bg-neon/10 text-neon border border-neon/20',
    orange: 'bg-sport-orange/10 text-sport-orange border border-sport-orange/20',
    red: 'bg-red-500/10 text-red-500 border border-red-500/20',
    gray: 'bg-gray-800 text-gray-400',
  };

  return (
    <span 
      className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
