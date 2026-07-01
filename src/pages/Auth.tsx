import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

interface AuthProps {
  type: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ type }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState(''); // 💡 حقل ولي الأمر

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      // 💡 إرسال رقم ولي الأمر مع البيانات
      const payload = type === 'register' 
        ? { name, email, password, phone, parentPhone } 
        : { email, password };

      const response = await axios.post(`https://abdullah-academy-backend.onrender.com${endpoint}`, payload);

      if (response.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('role', response.data.data.role);
        
        if (response.data.data.role === 'admin') {
          navigate('/admin');
        } else if (response.data.data.role === 'teacher') {
          navigate('/teacher'); // 💡 توجيه المدرس للوحته
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 'حدث خطأ في الاتصال بالخادم. تأكد من صحة البيانات.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in slide-in-from-bottom-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {type === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">الاسم الرباعي</label>
                <Input type="text" placeholder="أحمد محمود..." required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">رقم الطالب</label>
                  <Input type="tel" placeholder="010..." required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-amber-600">رقم ولي الأمر</label>
                  <Input type="tel" placeholder="010..." required dir="ltr" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-semibold mb-1">البريد الإلكتروني</label>
            <Input type="email" placeholder="student@example.com" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">كلمة المرور</label>
            <Input type="password" placeholder="••••••••" required dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <Button type="submit" className="w-full mt-6 text-lg h-14" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...</span>
            ) : (
              type === 'login' ? 'دخول' : 'تسجيل'
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          {type === 'login' ? (
            <>ليس لديك حساب؟ <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline font-bold">سجل الآن</button></>
          ) : (
            <>لديك حساب بالفعل؟ <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-bold">سجل دخولك</button></>
          )}
        </p>
      </Card>
    </div>
  );
};