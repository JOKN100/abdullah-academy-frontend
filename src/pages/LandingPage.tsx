import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, GraduationCap, Award, 
  ArrowRight, CheckCircle, ShieldCheck, Users, BrainCircuit,
  ClipboardList, Loader2, Sun, Moon, Layers, MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const token = localStorage.getItem('token');

  // فلاتر النظام 
  const [activeStage, setActiveStage] = useState<'إعدادي' | 'ثانوي'>('ثانوي');
  const [activeSystem, setActiveSystem] = useState<'أساسي' | 'بكالوريا'>('أساسي');
  const [activeGrade, setActiveGrade] = useState<'الصف الأول' | 'الصف الثاني' | 'الصف الثالث'>('الصف الثالث');
  const [activeTrack, setActiveTrack] = useState<'الطب' | 'الهندسة وعلوم الحاسب' | 'الآداب والفنون' | 'الأعمال'>('الطب');

  const handleDashboardRedirect = async () => {
    if (!token) return navigate('/login');
    setIsRedirecting(true);
    try {
      const res = await axios.get(' https://abdullah-academy-backend.onrender.com/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.data.role === 'admin' || res.data.data.role === 'teacher') navigate('/admin');
      else navigate('/dashboard');
    } catch(e) { 
      localStorage.removeItem('token'); navigate('/login'); 
    } finally { setIsRedirecting(false); }
  };

  // 💡 دالة الاشتراك عبر الواتساب
  const handleSubscribeViaWhatsApp = (courseTitle: string, teacherName: string) => {
    const message = encodeURIComponent(`السلام عليكم، أريد الاشتراك في كورس: "${courseTitle}" مع الأستاذ "${teacherName || 'العام'}".`);
    window.open(`https://wa.me/201018046619?text=${message}`, '_blank');
  };

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches; 
  });

  useEffect(() => {
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDark]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(' https://abdullah-academy-backend.onrender.com/api/courses');
        setFeaturedCourses(res.data.data); 
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const scrollToCourses = () => {
    document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // منطق الفلترة الذكي للكورسات
  const displayedCourses = featuredCourses.filter(course => {
    if (course.stage !== activeStage) return false;
    if (course.grade !== activeGrade) return false;
    if (activeStage === 'ثانوي') {
      const courseSys = course.educationSystem || 'أساسي';
      if (courseSys !== activeSystem) return false;
      if (activeSystem === 'بكالوريا' && (activeGrade === 'الصف الثاني' || activeGrade === 'الصف الثالث')) {
        const courseTrk = course.track || 'عام';
        if (courseTrk !== activeTrack) return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans transition-colors duration-500 selection:bg-blue-600 selection:text-white">
      
      <style>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
        @keyframes float-medium { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-10deg); } }
        @keyframes float-fast { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-25px) scale(1.1); } }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 5s ease-in-out infinite; }
      `}</style>

      <header className="absolute top-0 left-0 w-full z-50 p-4 md:px-8 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
        <div className="flex items-center gap-2"><div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-600/20"><Layers className="w-6 h-6" /></div><span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">منصة جاهز</span></div>
        <div className="flex items-center gap-4">
          <button onClick={scrollToCourses} className="text-sm font-bold text-slate-600 hover:text-blue-600 hidden sm:block">تصفح الكورسات</button>
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <section className="relative pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0 transition-colors duration-500" />
        
        <div className="absolute top-[15%] left-[10%] text-6xl text-blue-500/20 dark:text-blue-500/30 animate-float-slow select-none pointer-events-none">⚛</div>
        <div className="absolute top-[30%] right-[12%] text-6xl text-purple-500/20 dark:text-purple-500/30 animate-float-medium select-none pointer-events-none font-serif font-bold">Aa</div>
        <div className="absolute bottom-[20%] left-[15%] text-7xl text-emerald-500/20 dark:text-emerald-500/30 animate-float-fast select-none pointer-events-none">∑</div>
        <div className="absolute top-[60%] right-[20%] text-6xl text-amber-500/20 dark:text-amber-500/30 animate-float-slow select-none pointer-events-none">🌍</div>
        <div className="absolute bottom-[10%] right-[35%] text-7xl text-rose-500/20 dark:text-rose-500/30 animate-float-medium select-none pointer-events-none font-bold">ض</div>
        <div className="absolute top-[25%] left-[35%] text-6xl text-cyan-500/20 dark:text-cyan-500/30 animate-float-fast select-none pointer-events-none">🧬</div>

        <div className="z-10 animate-in fade-in slide-in-from-top-6 duration-1000">
          <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800/50 shadow-sm mb-6 backdrop-blur-sm transition-colors duration-500"><Award className="w-3.5 h-3.5 animate-pulse" /> المنصة التعليمية الأقوى في مصر</span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white mb-6 transition-colors duration-500">طريقك للتفوق مع <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 font-black">منصة جاهز</span></h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed transition-colors duration-500">نخبة من أفضل المعلمين في كافة المواد الدراسية، شرح تفصيلي، امتحانات دورية، ومتابعة مستمرة لضمان تفوقك.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={handleDashboardRedirect} disabled={isRedirecting} className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 rounded-xl group transition-all">
              {isRedirecting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (token ? 'الذهاب للوحة التحكم الخاصة بك' : 'تسجيل الدخول وبدء التعلم')}
              {!isRedirecting && <ArrowRight className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-[-4px]" />}
            </Button>
            <Button onClick={scrollToCourses} variant="outline" className="h-14 px-8 text-base border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              تصفح الكورسات المتاحة
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />, num: "+50", label: "معلم خبير" },
            { icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />, num: "100%", label: "تغطية لكل المواد" },
            { icon: <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, num: "+1000", label: "طالب متفوق سنوياً" },
            { icon: <BrainCircuit className="w-6 h-6 text-amber-600 dark:text-amber-400" />, num: "24/7", label: "امتحانات وتصحيح آلي" }
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 bg-white/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 backdrop-blur-md text-center hover:border-blue-500/50 dark:hover:border-slate-700 transition-all group hover:-translate-y-1 duration-300 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.num}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">المراحل الدراسية المغطاة بالكامل</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto">نقدم شرحاً تفصيلياً وافياً لكل جزئية في المنهج مع مذكرات حصرية وتدريبات مكثفة.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl relative overflow-hidden hover:border-blue-400 dark:hover:border-blue-900/60 transition-all group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 dark:bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-600/10 transition-colors" />
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"><BookOpen className="w-6 h-6" /> المرحلة الإعدادية</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">تأسيس قوي في كافة المواد لطلاب الصفوف الثلاثة:</p>
            <ul className="space-y-3">
              {['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي (الشهادة الإعدادية)'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm font-semibold"><CheckCircle className="w-4 h-4 text-blue-500" /> {item}</li>
              ))}
            </ul>
          </div>
          <div className="p-8 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl relative overflow-hidden hover:border-purple-400 dark:hover:border-purple-900/60 transition-all group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-200 dark:group-hover:bg-purple-600/10 transition-colors" />
            <h3 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2"><GraduationCap className="w-6 h-6" /> المرحلة الثانوية والبكالوريا</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">شاملة نظام الثانوية العامة التقليدي ونظام البكالوريا الجديد:</p>
            <ul className="space-y-3">
              {['مسار الطب', 'مسار الهندسة وعلوم الحاسب', 'مسار الآداب والفنون', 'مسار الأعمال'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm font-semibold"><CheckCircle className="w-4 h-4 text-purple-500" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="courses-section" className="py-20 px-4 max-w-7xl mx-auto relative z-10 scroll-m-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">تصفح الكورسات المتاحة</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">حدد المرحلة والصف لعرض كورسات أفضل المعلمين المتاحة لك.</p>
        </div>

        {/* فلاتر المرحلة */}
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => { setActiveStage('إعدادي'); setActiveSystem('أساسي'); }} className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${activeStage === 'إعدادي' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>المرحلة الإعدادية</button>
          <button onClick={() => setActiveStage('ثانوي')} className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${activeStage === 'ثانوي' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>المرحلة الثانوية</button>
        </div>

        {/* فلاتر النظام للثانوي */}
        {activeStage === 'ثانوي' && (
          <div className="flex justify-center gap-3 mb-6 animate-in zoom-in duration-300">
            <button onClick={() => setActiveSystem('أساسي')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeSystem === 'أساسي' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' : 'bg-transparent text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>ثانوية عامة (تقليدي)</button>
            <button onClick={() => setActiveSystem('بكالوريا')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeSystem === 'بكالوريا' ? 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800' : 'bg-transparent text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>نظام البكالوريا</button>
          </div>
        )}

        {/* فلاتر الصف */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {['الصف الأول', 'الصف الثاني', 'الصف الثالث'].map(grade => (
            <button key={grade} onClick={() => setActiveGrade(grade as any)} className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeGrade === grade ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
              {grade} {activeStage === 'إعدادي' ? 'الإعدادي' : 'الثانوي'}
            </button>
          ))}
        </div>

        {/* فلاتر مسارات البكالوريا */}
        {activeStage === 'ثانوي' && activeSystem === 'بكالوريا' && (activeGrade === 'الصف الثاني' || activeGrade === 'الصف الثالث') && (
          <div className="flex justify-center gap-2 mb-12 flex-wrap animate-in fade-in slide-in-from-top-4">
            {['الطب', 'الهندسة وعلوم الحاسب', 'الآداب والفنون', 'الأعمال'].map(track => (
              <button key={track} onClick={() => setActiveTrack(track as any)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTrack === track ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                مسار {track}
              </button>
            ))}
          </div>
        )}

        {/* عرض الكورسات */}
        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div> : displayedCourses.length === 0 ? <p className="text-slate-500 text-center text-sm font-bold bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-8">لا يوجد كورسات متاحة حالياً لهذا الاختيار، سيتم الإضافة قريباً...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {displayedCourses.map(course => (
              <Card key={course._id} className="overflow-hidden flex flex-col bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-900/50 transition-all duration-300 group shadow-sm relative">
                <div className="relative overflow-hidden aspect-video">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-200 dark:bg-slate-800" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                  
                  {course.teacherName && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                      {course.teacherImage && <img src={course.teacherImage} alt={course.teacherName} className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover shadow-lg bg-white" />}
                      <span className="text-white text-xs font-bold drop-shadow-md">{course.teacherName}</span>
                    </div>
                  )}
                  {course.educationSystem === 'بكالوريا' && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md z-10">بكالوريا - {course.track}</span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{course.description}</p>
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold text-base">{course.price} ج.م</span>
                    {/* 💡 تم ربط الزرار هنا بوظيفة الواتساب المباشرة */}
                    <button onClick={() => handleSubscribeViaWhatsApp(course.title, course.teacherName)} className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      <MessageCircle className="w-4 h-4" /> اشترك الآن
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 bg-white dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-900 px-4 transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "حماية فيديوهات صارمة", desc: "أنظمة أمان تمنع تصوير الشاشة وتطبع بيانات الطالب لمنع تسريب الحصص تماماً.", icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500" /> },
            { title: "امتحانات دورية آليّة", desc: "اختبارات مصممة بعد كل حصة تقيس مستوى الطالب وتظهر النتيجة تلقائياً.", icon: <ClipboardList className="w-8 h-8 text-purple-600 dark:text-purple-500" /> },
            { title: "متابعة وتصحيح واجبات", desc: "يرفع الطالب حله للواجب، ويتم رصد الدرجات وتدشين الملاحظات التنبيهية له.", icon: <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-500" /> }
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-2xl transition-colors group">
              <div className="shrink-0 w-14 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">{feature.icon}</div>
              <div><h4 className="text-lg font-bold mb-1.5 text-slate-900 dark:text-white">{feature.title}</h4><p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-900 text-slate-500 text-xs font-semibold bg-white dark:bg-transparent transition-colors duration-500">
        <p>© {new Date().getFullYear()} منصة جاهز التعليمية. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};