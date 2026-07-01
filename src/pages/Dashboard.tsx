import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const userRes = await axios.get('https://abdullah-academy-backend.onrender.com/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setUser(userRes.data.data);

        const coursesRes = await axios.get('https://abdullah-academy-backend.onrender.com/api/courses/my-courses', { headers: { Authorization: `Bearer ${token}` } });
        setMyCourses(coursesRes.data.data);
      } catch (err) { 
        console.error(err); 
        // لو التوكن خلص أو تم الدخول من جهاز تاني
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally { setIsLoading(false); }
    };
    fetchDashboardData();
  }, [navigate]);

  if (isLoading) return <div className="min-h-[80vh] flex justify-center items-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

  const groupedCourses = myCourses.reduce((acc, course) => {
    const teacher = course.teacherName || 'كورسات عامة';
    if (!acc[teacher]) acc[teacher] = [];
    acc[teacher].push(course);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          مرحباً بك، <span className="text-blue-600">{user?.name?.split(' ')[0] || 'يا بطل'}</span> 👋
        </h1>
        <p className="text-slate-500 text-lg">جاهز تواصل رحلة التفوق النهاردة؟</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          {myCourses.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center">
              <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">لم تشترك في أي كورسات بعد</h3>
              <p className="text-slate-500 mb-6">تصفح الكورسات المتاحة وابدأ المذاكرة الآن.</p>
              <Button onClick={() => navigate('/courses')}>تصفح الكورسات</Button>
            </Card>
          ) : (
            (Object.entries(groupedCourses) as [string, any[]][]).map(([teacher, teacherCourses]) => (
              <div key={teacher} className="mb-12">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                  👨‍🏫 كورسات الأستاذ: <span className="text-blue-600">{teacher}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherCourses.map((course: any) => (
                    <Card key={course._id} className="overflow-hidden flex flex-col group border-slate-200/60 dark:border-slate-800 hover:border-blue-500/50 transition-colors">
                      <div className="relative">
                        <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover bg-slate-200" />
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => navigate(`/play/${course._id}`)} className="gap-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                            <PlayCircle className="w-5 h-5" /> متابعة الشرح
                          </Button>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 font-semibold mb-2">
                            <span>جاري المتابعة</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-1/4 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>

        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none shadow-lg shadow-blue-600/20">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-300" /> إحصائياتك</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="font-semibold text-blue-50">الكورسات المشترك بها</span>
                <span className="font-extrabold text-2xl">{myCourses.length}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};