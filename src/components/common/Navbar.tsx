import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Moon, Sun, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // قراءة التوكن والرول من المتصفح
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  // تحديث حالة النافبار كلما تغير مسار الصفحة
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  }, [location.pathname]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // مسح الرول عند الخروج
    setToken(null);
    setRole(null);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight hidden sm:block text-slate-900 dark:text-white">
              منصة جاهز
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
              {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
            
            {token ? (
              <>
                {/* التبديل الذكي بين زر لوحة التحكم للإدارة وللطالب */}
                {role === 'admin' ? (
                  <Button variant="ghost" onClick={() => navigate('/admin')} className="hidden sm:flex gap-2 text-blue-600 dark:text-blue-400 font-bold">
                    <Settings className="w-4 h-4" /> لوحة الإدارة
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => navigate('/dashboard')} className="hidden sm:flex gap-2">
                    <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                  </Button>
                )}
                
                <Button variant="danger" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" /> خروج
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>دخول</Button>
                <Button onClick={() => navigate('/register')}>حساب جديد</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};