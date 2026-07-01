import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, Loader2, MessageCircle, PackageOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]); // 💡 ستيت الباقات
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [coursesRes, packagesRes] = await Promise.all([
          axios.get('https://abdullah-academy-backend.onrender.com/api/courses'),
          axios.get('https://abdullah-academy-backend.onrender.com  /api/packages').catch(() => ({ data: { data: [] } }))
        ]);
        setCourses(coursesRes.data.data);
        setPackages(packagesRes.data.data);
      } catch (err: any) {
        setError('حدث خطأ أثناء تحميل الكورسات. الرجاء المحاولة لاحقاً.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubscribeViaWhatsApp = (courseTitle: string, teacherName: string, isPackage = false) => {
    const type = isPackage ? 'باقة شاملة' : `كورس مع الأستاذ "${teacherName || 'العام'}"`;
    const message = encodeURIComponent(`السلام عليكم، أريد الاشتراك في ${type} باسم: "${courseTitle}".`);
    window.open(`https://wa.me/201018046619?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 animate-in fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            تصفح <span className="text-blue-600">الكورسات والباقات</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            اشترك الآن في الباقات الشاملة لتوفير أكثر، أو اختر الكورس المناسب لك.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="ابحث عن كورس (مثال: التفاضل)..."
            className="pl-4 pr-12 h-14 text-lg rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-semibold">جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-semibold">{error}</div>
        ) : (
          <>
            {/* 💡 قسم الباقات الشاملة */}
            {packages.length > 0 && !searchTerm && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-amber-600 dark:text-amber-500"><PackageOpen className="w-6 h-6" /> الباقات الشاملة (توفير أكثر)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {packages.map((pkg) => (
                    <Card key={pkg._id} className="overflow-hidden flex flex-col md:flex-row bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg transition-shadow">
                      <div className="md:w-2/5 relative">
                        <img src={pkg.thumbnail} alt={pkg.title} className="h-48 md:h-full w-full object-cover" />
                        <span className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">باقة توفير</span>
                      </div>
                      <div className="p-6 md:w-3/5 flex flex-col">
                        <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">{pkg.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{pkg.description}</p>
                        <div className="mb-4">
                          <p className="text-xs font-bold text-slate-500 mb-2">تشمل ({pkg.courses?.length || 0}) كورسات:</p>
                          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                            {pkg.courses?.slice(0, 3).map((c: any) => <li key={c._id} className="line-clamp-1">{c.title}</li>)}
                            {pkg.courses?.length > 3 && <li className="text-amber-600 font-bold">...والمزيد</li>}
                          </ul>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-amber-200 dark:border-amber-800/50">
                          <span className="font-black text-amber-700 dark:text-amber-400 text-2xl">{pkg.price} ج.م</span>
                          <Button onClick={() => handleSubscribeViaWhatsApp(pkg.title, '', true)} className="px-4 bg-amber-600 hover:bg-amber-700 gap-2"><MessageCircle className="w-4 h-4" /> اشتراك في الباقة</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* قسم الكورسات العادية */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-600" /> الكورسات الفردية</h2>
              {filteredCourses.length === 0 ? (
                <div className="text-center py-10"><BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-500">لا توجد كورسات مطابقة لبحثك</h3></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <Card key={course._id} className="overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300">
                      <div className="relative overflow-hidden h-52">
                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg leading-tight line-clamp-2">{course.title}</h3>
                        </div>
                        <p className="text-xs text-blue-600 font-bold mb-3">👨‍🏫 الأستاذ: {course.teacherName}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">{course.description}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xl">{course.price} ج.م</span>
                          <Button onClick={() => handleSubscribeViaWhatsApp(course.title, course.teacherName)} className="px-3 bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs"><MessageCircle className="w-4 h-4" /> اشتراك</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};