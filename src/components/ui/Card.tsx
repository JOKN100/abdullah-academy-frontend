import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // أضفنا هذا السطر
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div 
    style={style} // وأضفنا هذا السطر
    className={`rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm text-slate-950 shadow-sm hover:shadow-xl transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-900/80 dark:text-slate-50 ${className}`}
  >
    {children}
  </div>
);