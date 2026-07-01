import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-md";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 border-none",
    outline: "border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-none hover:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} h-12 py-2 px-6 ${className}`} {...props}>
      {children}
    </button>
  );
};