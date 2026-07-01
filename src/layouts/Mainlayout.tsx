import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans transition-colors duration-300 selection:bg-blue-200 selection:text-blue-900">
      <Navbar />
      <main className="flex-grow">
        {/* كلمة Outlet تعني: هنا سيتم عرض محتوى الصفحة المتغيرة (الرئيسية، تسجيل الدخول، الخ) */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};