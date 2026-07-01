import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, Users, PlusCircle, Loader2, Edit, 
  Trash2, EyeOff, Eye, X, AlertCircle, Video, FileText, 
  CheckCircle2, ClipboardList, BookCheck, ExternalLink, FileEdit, 
  BarChart3, TrendingUp, UsersRound, PhoneCall, LogOut, Sun, Moon, Camera
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'homeworks'>('overview');
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]); 
  const [pendingHomeworks, setPendingHomeworks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingField, setUploadingField] = useState<string>('');
  
  // إعدادات الوضع الليلي والصورة
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // الكورسات
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', thumbnail: '', stage: 'ثانوي', grade: 'الصف الأول', educationSystem: 'أساسي', track: 'عام' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  // الدروس والامتحانات
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<any>(null);
  const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', pdfUrl: '' });
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [lessonMessage, setLessonMessage] = useState({ type: '', text: '' });
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [lessonEditSubmitting, setLessonEditSubmitting] = useState(false);
  const [viewersModalData, setViewersModalData] = useState<{isOpen: boolean, lessonTitle: string, viewers: any[], loading: boolean}>({isOpen: false, lessonTitle: '', viewers: [], loading: false});

  const [selectedLessonForExam, setSelectedLessonForExam] = useState<any>(null);
  const [examData, setExamData] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examParams, setExamParams] = useState({ durationInMinutes: 30, passMark: 50 });
  const [newQuestion, setNewQuestion] = useState({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 });
  const [gradingHw, setGradingHw] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isGradingSubmit, setIsGradingSubmit] = useState(false);
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<any>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    setIsLoading(true); setError('');

    try {
      const userRes = await axios.get('https://abdullah-academy-backend.onrender.com/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (userRes.data.data.role !== 'teacher') return navigate('/dashboard');
      setUser(userRes.data.data);

      const dataRes = await axios.get('https://abdullah-academy-backend.onrender.com/api/teacher/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const teacherData = dataRes.data.data;
      
      setStats(teacherData.stats);
      setCourses(teacherData.courses);
      setStudents(teacherData.students);
      setPendingHomeworks(teacherData.homeworks);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token'); navigate('/login');
      } else setError('حدث خطأ في جلب البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    setUploadingField(fieldName);
    try {
      const formData = new FormData(); formData.append('file', file);
      const res = await axios.post('https://abdullah-academy-backend.onrender.com/api/upload', formData);
      return res.data.url;
    } catch (err) { alert('فشل الرفع'); return null; } finally { setUploadingField(''); }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axios.post('https://abdullah-academy-backend.onrender.com/api/upload', formData);
      const imageUrl = uploadRes.data.url;

      const token = localStorage.getItem('token');
      await axios.patch('https://abdullah-academy-backend.onrender.com/api/users/profile-image', { profileImage: imageUrl }, { headers: { Authorization: `Bearer ${token}` } });
      
      setUser({ ...user, profileImage: imageUrl });
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الصورة');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setFormError('');
    if (!newCourse.thumbnail) { setIsSubmitting(false); return setFormError('الرجاء رفع غلاف الكورس'); }
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://abdullah-academy-backend.onrender.com/api/courses', { ...newCourse, price: Number(newCourse.price), teacher: user._id }, { headers: { Authorization: `Bearer ${token}` } });
      setIsAddModalOpen(false); setNewCourse({ title: '', description: '', price: '', thumbnail: '', stage: 'ثانوي', grade: 'الصف الأول', educationSystem: 'أساسي', track: 'عام' }); fetchData();
    } catch (err: any) { setFormError(err.response?.data?.message || 'خطأ'); } finally { setIsSubmitting(false); }
  };

  const handleEditCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://abdullah-academy-backend.onrender.com/api/courses/${editingCourse._id}`, editingCourse, { headers: { Authorization: `Bearer ${token}` } });
      setIsEditCourseModalOpen(false); fetchData();
    } catch (err) { alert('خطأ في التعديل'); } finally { setIsSubmitting(false); }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('تأكيد الحذف نهائياً؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://abdullah-academy-backend.onrender.com/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData(); 
    } catch (err: any) { alert('خطأ أثناء الحذف.'); }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault(); setLessonSubmitting(true); setLessonMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://abdullah-academy-backend.onrender.com/api/courses/admin/${selectedCourseForLessons._id}/lessons`, newLesson, { headers: { Authorization: `Bearer ${token}` } });
      setLessonMessage({ type: 'success', text: response.data.message }); setSelectedCourseForLessons(response.data.data); setNewLesson({ title: '', videoUrl: '', pdfUrl: '' }); fetchData(); 
    } catch (err: any) { setLessonMessage({ type: 'error', text: err.response?.data?.message || 'خطأ' }); } finally { setLessonSubmitting(false); }
  };

  const handleEditLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLessonEditSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`https://abdullah-academy-backend.onrender.com/api/courses/admin/${selectedCourseForLessons._id}/lessons/${editingLesson._id}`, editingLesson, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedCourseForLessons(res.data.data); setIsEditLessonModalOpen(false); setLessonMessage({ type: 'success', text: 'تم التعديل بنجاح' }); fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'خطأ'); } finally { setLessonEditSubmitting(false); }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('تأكيد الحذف؟')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`https://abdullah-academy-backend.onrender.com/api/courses/admin/${selectedCourseForLessons._id}/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedCourseForLessons(res.data.data); setLessonMessage({ type: 'success', text: 'تم الحذف' }); fetchData();
    } catch (err: any) { alert('خطأ'); }
  };

  const handleViewLessonViews = async (lesson: any, courseId: string) => {
    setViewersModalData({ isOpen: true, lessonTitle: lesson.title, viewers: [], loading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://abdullah-academy-backend.onrender.com/api/courses/admin/${courseId}/lessons/${lesson._id}/viewers`, { headers: { Authorization: `Bearer ${token}` } });
      setViewersModalData({ isOpen: true, lessonTitle: lesson.title, viewers: res.data.data, loading: false });
    } catch (err) { alert('خطأ'); setViewersModalData(prev => ({ ...prev, loading: false })); }
  };

  const openExamModal = async (lesson: any, courseId: string) => {
    setSelectedLessonForExam({ ...lesson, courseId }); setExamData(null); setExamLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://abdullah-academy-backend.onrender.com/api/exams/lesson/${lesson._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExamData(res.data.data);
    } catch (err) { setExamData(null); } finally { setExamLoading(false); }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`https://abdullah-academy-backend.onrender.com/api/exams`, { courseId: selectedLessonForExam.courseId, lessonId: selectedLessonForExam._id, title: `امتحان: ${selectedLessonForExam.title}`, durationInMinutes: examParams.durationInMinutes, passMark: examParams.passMark }, { headers: { Authorization: `Bearer ${token}` } });
      setExamData(res.data.data);
    } catch (err: any) { alert(err.response?.data?.message || 'خطأ'); }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.options.some(opt => opt.trim() === '')) return alert('تعبئة جميع الاختيارات');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`https://abdullah-academy-backend.onrender.com/api/exams/${examData._id}/questions`, newQuestion, { headers: { Authorization: `Bearer ${token}` } });
      setExamData(res.data.data); setNewQuestion({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }); 
    } catch (err: any) { alert(err.response?.data?.message || 'خطأ'); }
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault(); setIsGradingSubmit(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://abdullah-academy-backend.onrender.com/api/homeworks/${gradingHw._id}/grade`, { grade: gradeInput, feedback: feedbackInput }, { headers: { Authorization: `Bearer ${token}` } });
      setGradingHw(null); setGradeInput(0); setFeedbackInput(''); fetchData(); 
    } catch (err) { alert('خطأ'); } finally { setIsGradingSubmit(false); }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in flex flex-col md:flex-row gap-8 relative text-slate-900 dark:text-white">
        
        {/* التأثيرات البصرية */}
        <style>{`
          @keyframes float-slow { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
          @keyframes float-medium { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-10deg); } }
          .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        `}</style>

      <div className="fixed top-[15%] left-[5%] text-6xl text-blue-500/10 dark:text-blue-500/5 animate-float-slow select-none pointer-events-none z-0">⚛</div>
      <div className="fixed bottom-[20%] right-[15%] text-7xl text-emerald-500/10 dark:text-emerald-500/5 animate-float-medium select-none pointer-events-none z-0">∑</div>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* الشريط الجانبي */}
      <aside className="w-full md:w-64 shrink-0 relative z-10">
        <Card className="p-4 sticky top-24 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 backdrop-blur-md flex flex-col min-h-[calc(100vh-120px)]">
          
          {/* 💡 قسم الصورة الشخصية المعدل */}
          <div className="text-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 relative">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-3xl shadow-sm overflow-hidden border-2 border-white dark:border-slate-800">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'أ'
                )}
              </div>
              {/* أيقونة رفع الصورة */}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                {isUploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
              </label>
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white line-clamp-1">{user?.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">لوحة المعلم</p>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><BarChart3 className="w-5 h-5" /> نظرة عامة</button>
            <button onClick={() => setActiveTab('courses')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><BookOpen className="w-5 h-5" /> كورساتي</button>
            <button onClick={() => setActiveTab('students')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><Users className="w-5 h-5" /> طلابي المتابعين</button>
            <button onClick={() => setActiveTab('homeworks')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'homeworks' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><BookCheck className="w-5 h-5" /> تصحيح الواجبات</button>
          </nav>

          {/* 💡 أزرار الوضع الليلي وتسجيل الخروج في أسفل القائمة */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-2">
            <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
              {isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400">
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </Card>
      </aside>

      <main className="flex-1 relative z-10">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 font-semibold flex items-center gap-2 border border-red-200 dark:border-red-800"><AlertCircle className="w-5 h-5" /> {error}</div>}

        {/* Overview */}
        {activeTab === 'overview' && (
           <div className="animate-in fade-in space-y-8">
             <div className="flex justify-between gap-2">
               <h1 className="text-2xl font-black">نظرة عامة على كورساتك</h1>
               <p className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> تحديث مباشر</p>
             </div>
             {isLoading ? <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div> : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { title: 'طلابي', value: stats?.counters?.totalStudents || 0, icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'border-blue-100 dark:border-blue-900/50', iconBg: 'bg-blue-50 dark:bg-blue-900/30' },
                    { title: 'كورساتي المنشورة', value: stats?.counters?.totalCourses || 0, icon: <BookOpen className="w-5 h-5 text-purple-600" />, bg: 'border-purple-100 dark:border-purple-900/50', iconBg: 'bg-purple-50 dark:bg-purple-900/30' },
                    { title: 'واجبات معلقة', value: stats?.counters?.pendingHomeworks || 0, icon: <BookCheck className="w-5 h-5 text-amber-600" />, bg: 'border-amber-100 dark:border-amber-900/50', iconBg: 'bg-amber-50 dark:bg-amber-900/30', notify: (stats?.counters?.pendingHomeworks > 0) },
                    { title: 'الاختبارات', value: stats?.counters?.totalExams || 0, icon: <ClipboardList className="w-5 h-5 text-emerald-600" />, bg: 'border-emerald-100 dark:border-emerald-900/50', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                  ].map((card, i) => (
                    <Card key={i} className={`p-5 relative ${card.bg} shadow-sm bg-white dark:bg-slate-900`}>
                      {card.notify && <span className="absolute top-3 left-3 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />}
                      <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">{card.title}</span><div className={`p-2 rounded-lg ${card.iconBg}`}>{card.icon}</div></div>
                      <h2 className="text-3xl font-black">{card.value}</h2>
                    </Card>
                  ))}
                </div>

                {stats?.advancedCourseStats && stats.advancedCourseStats.length > 0 && (
                  <div className="mt-12 animate-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                      <BarChart3 className="w-6 h-6 text-blue-600" /> إحصائيات تفصيلية
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {stats.advancedCourseStats.map((cStat: any, index: number) => (
                        <Card key={index} className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 line-clamp-1">{cStat.title}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">الطلاب</p>
                              <p className="font-black text-lg text-blue-600 dark:text-blue-400">{cStat.studentsCount} <span className="text-xs font-bold text-blue-400 dark:text-blue-500">طالب</span></p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">الواجبات</p>
                              <p className="font-black text-lg text-amber-600 dark:text-amber-400">{cStat.homeworksCount}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 text-center">
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">الاختبارات</p>
                              <p className="font-black text-lg text-purple-600 dark:text-purple-400">{cStat.examsCount}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">متوسط النجاح</p>
                              <p className="font-black text-lg text-emerald-600 dark:text-emerald-400">{cStat.avgSuccessRate}%</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
           </div>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold">كورساتي التعليمية</h1><Button onClick={() => setIsAddModalOpen(true)} className="gap-2"><PlusCircle className="w-5 h-5" /> إضافة كورس جديد</Button></div>
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div> : courses.length === 0 ? <Card className="p-12 text-center border-dashed border-2 dark:border-slate-800"><h3 className="text-xl font-bold text-slate-500">لا يوجد كورسات</h3></Card> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map(course => (
                  <Card key={course._id} className="overflow-hidden flex flex-col shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <img src={course.thumbnail} alt={course.title} className="h-48 w-full object-cover bg-slate-200 dark:bg-slate-800" />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1"><h3 className="font-bold text-lg mb-1">{course.title}</h3>{course.isActive ? <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-1 rounded-md font-bold shrink-0 flex items-center gap-1"><Eye className="w-3 h-3"/> مفعل</span> : <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-1 rounded-md font-bold shrink-0 flex items-center gap-1"><EyeOff className="w-3 h-3"/> مخفي</span>}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">{course.stage} - {course.grade}</p>
                      <Button variant="outline" className="w-full mt-2 mb-4 gap-2 text-blue-600 dark:text-blue-400 dark:border-blue-900" onClick={() => setSelectedCourseForLessons(course)}><Video className="w-4 h-4" /> إدارة المحتوى ({course.lessons?.length || 0} دروس)</Button>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">{course.price} ج.م</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingCourse(course); setIsEditCourseModalOpen(true); }} className="p-2 text-blue-600 bg-slate-100 dark:bg-slate-800 dark:text-blue-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteCourse(course._id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
           <div className="animate-in fade-in">
             <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold flex items-center gap-2">قائمة طلابي <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm">{students.length}</span></h1></div>
             {students.length === 0 ? <Card className="p-12 text-center border-dashed border-2 dark:border-slate-800"><h3 className="text-xl font-bold text-slate-500">لا يوجد طلاب مشتركين في كورساتك بعد.</h3></Card> : (
               <Card className="overflow-hidden shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                   <div className="overflow-x-auto">
                     <table className="w-full text-right text-sm">
                       <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700"><tr><th className="px-6 py-4">اسم الطالب</th><th className="px-6 py-4">موبايل</th><th className="px-6 py-4 text-amber-600 dark:text-amber-500">ولي الأمر</th><th className="px-6 py-4 text-center">التقدم</th><th className="px-6 py-4 text-center">تواصل</th></tr></thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {students.map((student) => (
                           <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                             <td className="px-6 py-4 font-bold">{student.name}</td><td className="px-6 py-4" dir="ltr">{student.phone}</td><td className="px-6 py-4 font-mono text-amber-600 dark:text-amber-500" dir="ltr">{student.parentPhone || '---'}</td>
                             <td className="px-6 py-4 text-center"><Button variant="outline" className="h-7 px-3 text-xs dark:border-slate-700" onClick={() => setSelectedStudentForProgress(student)}>متابعة</Button></td>
                             <td className="px-6 py-4 flex justify-center"><a href={`https://wa.me/2${student.phone}`} target="_blank" rel="noreferrer" className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors" title="مراسلة الطالب"><PhoneCall className="w-4 h-4" /></a></td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </Card>
             )}
           </div>
        )}

        {/* Homeworks */}
        {activeTab === 'homeworks' && (
           <div className="animate-in fade-in">
             <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><BookCheck className="w-6 h-6 text-amber-500" /> تصحيح وفحص الواجبات</h1></div>
             {isLoading ? <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div> : pendingHomeworks.length === 0 ? <Card className="p-16 text-center border-dashed border-2 dark:border-slate-800 bg-transparent"><CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" /><h3 className="text-xl font-bold text-slate-500">لا يوجد واجبات معلقة.</h3></Card> : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {pendingHomeworks.map((hw: any) => (
                   <Card key={hw._id} className="p-5 flex flex-col border-amber-100 dark:border-amber-900/50 shadow-sm bg-white dark:bg-slate-900">
                     <div className="flex items-start justify-between mb-4"><div><h4 className="font-bold line-clamp-1">{hw.studentId?.name}</h4><p className="text-xs text-slate-500">{hw.studentId?.phone}</p></div><span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-1 rounded">جديد</span></div>
                     <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-4"><p className="text-sm font-semibold line-clamp-1 mb-1">الكورس: {hw.courseId?.title}</p><a href={hw.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 py-2 rounded-md text-sm font-bold transition-colors"><ExternalLink className="w-4 h-4" /> فتح الواجب</a></div>
                     <Button onClick={() => { setGradingHw(hw); setGradeInput(100); setFeedbackInput('ممتاز جداً'); }} className="w-full mt-auto bg-amber-500 hover:bg-amber-600 text-white gap-2"><FileEdit className="w-4 h-4" /> رصد الدرجة</Button>
                   </Card>
                 ))}
               </div>
             )}
           </div>
        )}
      </main>

      {/* المودالز */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10"><h3 className="font-bold text-lg">كورس جديد</h3><button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg dark:bg-red-900/30 dark:text-red-400">{formError}</div>}
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-1">اسم الكورس</label><Input required value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                  <div><label className="block text-sm font-semibold mb-1">سعر الكورس</label><Input required type="number" min="0" value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">صورة الغلاف</label>
                  <div className="flex gap-2 items-center">
                    <Input type="file" accept="image/*" onChange={async (e) => { const url = await handleFileUpload(e, 'thumbnail'); if (url) setNewCourse({...newCourse, thumbnail: url}); }} className="cursor-pointer p-0 h-auto dark:bg-slate-950 dark:border-slate-700" />
                    {uploadingField === 'thumbnail' && <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">المرحلة الدراسية</label>
                    <select required value={newCourse.stage || 'ثانوي'} onChange={(e) => setNewCourse({...newCourse, stage: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                      <option value="إعدادي">إعدادي</option>
                      <option value="ثانوي">ثانوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">الصف الدراسي</label>
                    <select required value={newCourse.grade || 'الصف الأول'} onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                      {newCourse.stage === 'إعدادي' ? (
                        <>
                          <option value="الصف الأول">الصف الأول الإعدادي</option>
                          <option value="الصف الثاني">الصف الثاني الإعدادي</option>
                          <option value="الصف الثالث">الصف الثالث الإعدادي</option>
                        </>
                      ) : (
                        <>
                          <option value="الصف الأول">الصف الأول الثانوي</option>
                          <option value="الصف الثاني">الصف الثاني الثانوي</option>
                          <option value="الصف الثالث">الصف الثالث الثانوي</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* 💡 الشروط الذكية للأنظمة والمسارات في تالتة ثانوي */}
                {newCourse.stage === 'ثانوي' && newCourse.grade === 'الصف الثالث' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-blue-600 dark:text-blue-400">القسم</label>
                      <select required value={newCourse.educationSystem || 'عامة'} onChange={(e) => setNewCourse({...newCourse, educationSystem: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                        <option value="عامة">عامة</option>
                        <option value="بكالوريا">بكالوريا</option>
                      </select>
                    </div>
                    
                    {newCourse.educationSystem === 'بكالوريا' && (
                      <div className="animate-in fade-in">
                        <label className="block text-sm font-semibold mb-1 text-blue-600 dark:text-blue-400">المسار</label>
                        <select required value={newCourse.track || 'مسار الطب'} onChange={(e) => setNewCourse({...newCourse, track: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                          <option value="مسار الطب">مسار الطب</option>
                          <option value="مسار الهندسة وعلوم الحاسب">مسار الهندسة وعلوم الحاسب</option>
                          <option value="مسار الآداب والفنون">مسار الآداب والفنون</option>
                          <option value="مسار الأعمال">مسار الأعمال</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div><label className="block text-sm font-semibold mb-1">الوصف</label><textarea required rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm bg-transparent dark:bg-slate-950" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} /></div>
                <div className="pt-4 flex gap-3"><Button type="submit" className="flex-1" disabled={isSubmitting || uploadingField !== ''}>{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'نشر الكورس'}</Button></div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {isEditCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10"><h3 className="font-bold text-lg">تعديل الكورس</h3><button onClick={() => setIsEditCourseModalOpen(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              <form onSubmit={handleEditCourseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-1">اسم الكورس</label><Input required value={editingCourse.title} onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                  <div><label className="block text-sm font-semibold mb-1">سعر الكورس</label><Input required type="number" min="0" value={editingCourse.price} onChange={(e) => setEditingCourse({...editingCourse, price: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">تحديث الغلاف (اختياري)</label>
                  <div className="flex gap-2 items-center">
                    <Input type="file" accept="image/*" onChange={async (e) => { const url = await handleFileUpload(e, 'editThumbnail'); if (url) setEditingCourse({...editingCourse, thumbnail: url}); }} className="cursor-pointer p-0 h-auto dark:bg-slate-950 dark:border-slate-700" />
                    {uploadingField === 'editThumbnail' && <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">المرحلة الدراسية</label>
                    <select required value={editingCourse.stage || 'ثانوي'} onChange={(e) => setEditingCourse({...editingCourse, stage: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                      <option value="إعدادي">إعدادي</option>
                      <option value="ثانوي">ثانوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">الصف الدراسي</label>
                    <select required value={editingCourse.grade || 'الصف الأول'} onChange={(e) => setEditingCourse({...editingCourse, grade: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                      {editingCourse.stage === 'إعدادي' ? (
                        <>
                          <option value="الصف الأول">الصف الأول الإعدادي</option>
                          <option value="الصف الثاني">الصف الثاني الإعدادي</option>
                          <option value="الصف الثالث">الصف الثالث الإعدادي</option>
                        </>
                      ) : (
                        <>
                          <option value="الصف الأول">الصف الأول الثانوي</option>
                          <option value="الصف الثاني">الصف الثاني الثانوي</option>
                          <option value="الصف الثالث">الصف الثالث الثانوي</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* 💡 الشروط الذكية للأنظمة والمسارات في تالتة ثانوي */}
                {editingCourse.stage === 'ثانوي' && editingCourse.grade === 'الصف الثالث' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-blue-600 dark:text-blue-400">القسم</label>
                      <select required value={editingCourse.educationSystem || 'عامة'} onChange={(e) => setEditingCourse({...editingCourse, educationSystem: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                        <option value="عامة">عامة</option>
                        <option value="بكالوريا">بكالوريا</option>
                      </select>
                    </div>
                    
                    {editingCourse.educationSystem === 'بكالوريا' && (
                      <div className="animate-in fade-in">
                        <label className="block text-sm font-semibold mb-1 text-blue-600 dark:text-blue-400">المسار</label>
                        <select required value={editingCourse.track || 'مسار الطب'} onChange={(e) => setEditingCourse({...editingCourse, track: e.target.value})} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm bg-transparent dark:bg-slate-950 focus:ring-blue-600">
                          <option value="مسار الطب">مسار الطب</option>
                          <option value="مسار الهندسة وعلوم الحاسب">مسار الهندسة وعلوم الحاسب</option>
                          <option value="مسار الآداب والفنون">مسار الآداب والفنون</option>
                          <option value="مسار الأعمال">مسار الأعمال</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div><label className="block text-sm font-semibold mb-1">الوصف</label><textarea required rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm bg-transparent dark:bg-slate-950" value={editingCourse.description} onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})} /></div>
                <div className="pt-4 flex gap-3"><Button type="submit" className="flex-1" disabled={isSubmitting || uploadingField !== ''}>{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'حفظ التعديلات'}</Button></div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {selectedCourseForLessons && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <button onClick={() => setSelectedCourseForLessons(null)} className="absolute top-4 left-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6 pt-12">
              <h2 className="text-2xl font-bold mb-2">إدارة محتوى: <span className="text-blue-600">{selectedCourseForLessons.title}</span></h2>
              {lessonMessage.text && (
                <div className={`p-3 my-4 text-sm font-bold rounded-lg ${lessonMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {lessonMessage.text}
                </div>
              )}
              <div className="mt-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                <h3 className="font-bold text-lg mb-4">إضافة درس جديد</h3>
                <form onSubmit={handleAddLesson} className="space-y-4">
                  <div><label className="block text-sm mb-1">عنوان الدرس</label><Input required value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                  <div><label className="block text-sm mb-1">رابط الفيديو</label><Input required dir="ltr" value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                  <div>
                    <label className="block text-sm mb-1">مذكرة (PDF)</label>
                    <Input type="file" accept="application/pdf" onChange={async (e) => { const url = await handleFileUpload(e, 'pdfUrl'); if (url) setNewLesson({...newLesson, pdfUrl: url}); }} className="dark:bg-slate-950 dark:border-slate-700 cursor-pointer p-0 h-auto" />
                  </div>
                  <Button type="submit" disabled={lessonSubmitting || uploadingField === 'pdfUrl'} className="w-full">حفظ وإضافة</Button>
                </form>
              </div>
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">الدروس الحالية</h3>
                <div className="space-y-3">
                  {selectedCourseForLessons.lessons?.map((lesson: any, index: number) => (
                    <div key={index} className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl gap-4">
                      <span className="font-bold text-sm">{index + 1}. {lesson.title}</span>
                      <div className="flex gap-2 flex-wrap">
                        {lesson.pdfUrl && <FileText className="w-4 h-4 text-emerald-600" />}
                        <Button variant="outline" className="h-8 px-2 text-xs dark:border-slate-600" onClick={() => handleViewLessonViews(lesson, selectedCourseForLessons._id)}><UsersRound className="w-3 h-3" /> مشاهدات</Button>
                        <Button variant="outline" className="h-8 px-2 text-xs dark:border-slate-600" onClick={() => { setEditingLesson(lesson); setIsEditLessonModalOpen(true); }}><Edit className="w-3 h-3" /> تعديل</Button>
                        <Button variant="outline" className="h-8 px-2 text-xs text-red-600 dark:border-slate-600" onClick={() => handleDeleteLesson(lesson._id)}><Trash2 className="w-3 h-3" /> حذف</Button>
                        <Button variant="outline" className="h-8 px-2 text-xs text-purple-600 dark:border-slate-600" onClick={() => openExamModal(lesson, selectedCourseForLessons._id)}><ClipboardList className="w-3 h-3" /> امتحان</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {isEditLessonModalOpen && editingLesson && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-lg shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between"><h3 className="font-bold">تعديل الدرس</h3><button onClick={() => setIsEditLessonModalOpen(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              <form onSubmit={handleEditLessonSubmit} className="space-y-4">
                <div><label className="block text-sm">العنوان</label><Input required value={editingLesson.title} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                <div><label className="block text-sm">الفيديو</label><Input required dir="ltr" value={editingLesson.videoUrl} onChange={e => setEditingLesson({...editingLesson, videoUrl: e.target.value})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                <div>
                  <label className="block text-sm">تحديث (PDF)</label>
                  <Input type="file" accept="application/pdf" onChange={async (e) => { const url = await handleFileUpload(e, 'editPdfUrl'); if (url) setEditingLesson({...editingLesson, pdfUrl: url}); }} className="dark:bg-slate-950 dark:border-slate-700 cursor-pointer p-0 h-auto" />
                </div>
                <Button type="submit" className="w-full" disabled={lessonEditSubmitting}>حفظ التعديلات</Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {viewersModalData.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between"><h3 className="font-bold">مشاهدات: {viewersModalData.lessonTitle}</h3><button onClick={() => setViewersModalData({isOpen: false, lessonTitle: '', viewers: [], loading: false})}><X className="w-5 h-5" /></button></div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {viewersModalData.loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : viewersModalData.viewers.length === 0 ? <div className="text-center py-8">لا يوجد مشاهدات بعد</div> : (
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><tr><th className="p-3">الطالب</th><th className="p-3">هاتف</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{viewersModalData.viewers.map((v: any, i: number) => <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30"><td className="p-3 font-bold">{v.name}</td><td className="p-3 font-mono" dir="ltr">{v.phone}</td></tr>)}</tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}

      {selectedLessonForExam && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 dark:bg-slate-900/90 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between"><h3 className="font-bold">امتحان: {selectedLessonForExam.title}</h3><button onClick={() => setSelectedLessonForExam(null)}><X className="w-5 h-5" /></button></div>
            <div className="p-6 overflow-y-auto flex-1">
              {examLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : !examData ? (
                <form onSubmit={handleCreateExam} className="space-y-4 max-w-md mx-auto">
                  <div><label className="block text-sm">المدة (دقائق)</label><Input type="number" required value={examParams.durationInMinutes} onChange={e => setExamParams({...examParams, durationInMinutes: Number(e.target.value)})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                  <div><label className="block text-sm">النجاح (%)</label><Input type="number" required value={examParams.passMark} onChange={e => setExamParams({...examParams, passMark: Number(e.target.value)})} className="dark:bg-slate-950 dark:border-slate-700" /></div>
                  <Button type="submit" className="w-full">إنشاء الامتحان</Button>
                </form>
              ) : (
                <div className="space-y-8">
                  <Card className="p-5 border-purple-100 dark:border-purple-900/50 shadow-sm bg-white dark:bg-slate-950">
                    <h4 className="font-bold mb-4">إضافة سؤال</h4>
                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <textarea required className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent" value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        {newQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2"><input type="radio" className="accent-blue-600 w-4 h-4" checked={newQuestion.correctOptionIndex === idx} onChange={() => setNewQuestion({...newQuestion, correctOptionIndex: idx})} /><Input required value={opt} onChange={e => { const o = [...newQuestion.options]; o[idx] = e.target.value; setNewQuestion({...newQuestion, options: o}); }} className="dark:bg-slate-900 dark:border-slate-700" /></div>
                        ))}
                      </div>
                      <Button type="submit">حفظ السؤال</Button>
                    </form>
                  </Card>
                  {examData.questions?.map((q: any, i: number) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><p className="font-bold">{i+1}. {q.questionText}</p></div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {gradingHw && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-md shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-amber-500 p-4 flex justify-between text-white"><h3 className="font-bold">تصحيح واجب: {gradingHw.studentId?.name}</h3><button onClick={() => setGradingHw(null)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmitGrade} className="p-6 space-y-4">
              <div><label className="block text-sm font-bold">الدرجة (من 100)</label><Input type="number" required value={gradeInput} onChange={e => setGradeInput(Number(e.target.value))} className="dark:bg-slate-950 dark:border-slate-700" /></div>
              <div><label className="block text-sm font-bold">ملاحظات</label><textarea className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent" value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} /></div>
              <Button type="submit" disabled={isGradingSubmit} className="w-full bg-amber-500 hover:bg-amber-600">{isGradingSubmit ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ النتيجة'}</Button>
            </form>
          </Card>
        </div>
      )}

      {selectedStudentForProgress && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-2xl shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between"><h3 className="font-bold">تقدم: {selectedStudentForProgress.name}</h3><button onClick={() => setSelectedStudentForProgress(null)}><X className="w-5 h-5" /></button></div>
            <div className="p-6">
              {!selectedStudentForProgress.enrolledCourses?.length ? <p className="text-center font-bold text-slate-500">غير مفعل في أي كورس</p> : (
                <div className="space-y-4">
                  {selectedStudentForProgress.enrolledCourses.map((cId: string) => {
                    const c = courses.find(x => x._id === cId);
                    if (!c) return null;
                    const p = selectedStudentForProgress.courseProgress?.find((x: any) => x.course === cId);
                    const comp = p ? p.completedLessons.length : 0;
                    const total = c.lessons?.length || 0;
                    const pct = total ? Math.round((comp/total)*100) : 0;
                    return (
                      <div key={cId} className="border border-slate-200 dark:border-slate-700 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <h4 className="font-bold">{c.title}</h4>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 mt-2 rounded"><div className="bg-blue-600 h-2 rounded" style={{width: `${pct}%`}}></div></div>
                        <p className="text-xs text-slate-500 mt-1">{comp} من {total} درس ({pct}%)</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
    </div>
  );
};