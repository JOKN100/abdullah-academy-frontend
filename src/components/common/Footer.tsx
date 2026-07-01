import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-8 bg-white dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm font-semibold">
        <p>© {new Date().getFullYear()} تم التصميم بواسطة م/عبدالله فواز للتواصل 01018046619
        </p>
      </div>
    </footer>
  );
};