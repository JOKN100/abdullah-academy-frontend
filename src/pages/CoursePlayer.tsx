import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { Loader2, PlayCircle, FileText, AlertCircle, ChevronRight, VideoOff, ClipboardList, CheckCircle2, XCircle, UploadCloud, FileEdit, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Player = ReactPlayer as any;

const AdBanner: React.FC = () => {
  useEffect(() => {
    try {
      const pushAd = () => {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      };
      
      // بنعمل تأخير بسيط جداً عشان نتأكد إن العنصر اترسم في الشاشة
      setTimeout(pushAd, 100);
    } catch (e) {
      console.error("AdSense Error: ", e);
    }
  }, []); // الكود ده هيشتغل مرة واحدة لما الدرس يفتح

  return (
    <div className="w-full my-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center min-h-[90px] overflow-hidden relative border border-slate-200 dark:border-slate-700/50 shadow-sm">
      <span className="absolute z-0 text-slate-400 dark:text-slate-500 font-bold text-xs">مساحة إعلانية - منصة عبدالله أكاديمي</span>
      
      <ins className="adsbygoogle relative z-10 block w-full" 
           style={{ display: 'block' }}
           data-ad-client="ca-pub-2979608987445865" 
           data-ad-slot="4807584059" 
           data-ad-format="auto" 
           data-full-width-responsive="true">
      </ins>
    </div>
  );
};

export const CoursePlayer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [videoError, setVideoError] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });

  const [lessonExam, setLessonExam] = useState<any>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [examResult, setExamResult] = useState<any>(null);

  const [homeworkData, setHomeworkData] = useState<any>(null);
  const [homeworkLink, setHomeworkLink] = useState('');
  const [isUploadingHw, setIsUploadingHw] = useState(false); 
  const [isHwSubmitting, setIsHwSubmitting] = useState(false); 

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourseAndUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const userRes = await axios.get('https://abdullah-academy-backend.onrender.com/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setUser(userRes.data.data);
        const progress = userRes.data.data.courseProgress?.find((p: any) => p.course === id);
        if (progress) setCompletedLessons(progress.completedLessons);

        const courseRes = await axios.get(`https://abdullah-academy-backend.onrender.com/api/courses/${id}/play`, { headers: { Authorization: `Bearer ${token}` } });
        setCourse(courseRes.data.data);
      } catch (err: any) { setError(err.response?.data?.message || 'حدث خطأ'); } finally { setIsLoading(false); }
    };
    fetchCourseAndUser();
  }, [id, navigate]);

  const activeLesson = course?.lessons?.[activeLessonIndex];

  useEffect(() => {
    const fetchLessonExtras = async () => {
      if (!activeLesson?._id) return;
      const token = localStorage.getItem('token');
      try { const examRes = await axios.get(`https://abdullah-academy-backend.onrender.com/api/exams/lesson/${activeLesson._id}`, { headers: { Authorization: `Bearer ${token}` } }); setLessonExam(examRes.data.data); } catch (err) { setLessonExam(null); }
      try { const hwRes = await axios.get(`https://abdullah-academy-backend.onrender.com/api/homeworks/status/${activeLesson._id}`, { headers: { Authorization: `Bearer ${token}` } }); setHomeworkData(hwRes.data.data); setHomeworkLink(hwRes.data.data ? hwRes.data.data.fileUrl : ''); } catch (err) { setHomeworkData(null); setHomeworkLink(''); }
    };
    fetchLessonExtras();
  }, [activeLesson]);

  useEffect(() => { setVideoError(false); setIsExamModalOpen(false); setAnswers({}); setExamResult(null); }, [activeLessonIndex]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) || (e.ctrlKey && e.key === 'U') || e.key === 'PrintScreen') { e.preventDefault(); alert('⚠️ غير مسموح باستخدام هذه الخاصية.'); }
    };
    document.addEventListener('contextmenu', handleContextMenu); document.addEventListener('keydown', handleKeyDown);
    const watermarkInterval = setInterval(() => { setWatermarkPos({ top: `${Math.floor(Math.random() * 80) + 10}%`, left: `${Math.floor(Math.random() * 70) + 5}%` }); }, 5000);
    return () => { document.removeEventListener('contextmenu', handleContextMenu); document.removeEventListener('keydown', handleKeyDown); clearInterval(watermarkInterval); };
  }, []);

  const playerConfig = useMemo(() => ({ youtube: { playerVars: { showinfo: 0, rel: 0, modestbranding: 1, fs: 1, origin: window.location.origin } }, file: { attributes: { controlsList: 'nodownload', crossOrigin: 'anonymous' }, forceHLS: true } }), []);
  const handleVideoError = useCallback(() => { setVideoError(true); }, []);
  const handleLessonComplete = async () => {
    if (!activeLesson || completedLessons.includes(activeLesson._id)) return;
    try { const token = localStorage.getItem('token'); await axios.post(`https://abdullah-academy-backend.onrender.com/api/courses/${course._id}/lessons/${activeLesson._id}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } }); setCompletedLessons(prev => [...prev, activeLesson._id]); } catch (err) {}
  };

  const handleSubmitExam = () => {
    if (Object.keys(answers).length < lessonExam.questions.length) return alert('أجب على جميع الأسئلة!');
    let score = 0; lessonExam.questions.forEach((q: any, i: number) => { if (answers[i] === q.correctOptionIndex) score += 1; });
    const percentage = Math.round((score / lessonExam.questions.length) * 100);
    setExamResult({ score, total: lessonExam.questions.length, percentage, isPassed: percentage >= lessonExam.passMark });
  };

  const handleHomeworkUploadAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkLink) return alert('الرجاء رفع الملف أولاً');
    setIsHwSubmitting(true);
    try { const token = localStorage.getItem('token'); const res = await axios.post(`https://abdullah-academy-backend.onrender.com/api/homeworks/submit`, { courseId: course._id, lessonId: activeLesson._id, fileUrl: homeworkLink }, { headers: { Authorization: `Bearer ${token}` } }); setHomeworkData(res.data.data); alert('تم تسليم الواجب بنجاح!'); } catch (err: any) { alert('خطأ أثناء تسليم الواجب'); } finally { setIsHwSubmitting(false); }
  };

  const openPdf = () => { let url = activeLesson.pdfUrl; if (!url.startsWith('http')) url = 'https://' + url; window.open(url, '_blank'); };
  const progressPercentage = course?.lessons?.length ? Math.round((completedLessons.length / course.lessons.length) * 100) : 0;

  // 💡 دالة التواصل عبر الواتساب للسؤال في الدرس
  const handleAskQuestion = () => {
    const message = encodeURIComponent(`السلام عليكم، عندي استفسار بخصوص درس "${activeLesson.title}" في كورس "${course.title}".`);
    window.open(`https://wa.me/201552571846?text=${message}`, '_blank');
  };

  const renderVideoPlayer = () => {
    let videoUrl = activeLesson?.videoUrl?.trim() || '';
    if (videoUrl.includes('<iframe')) { const srcMatch = videoUrl.match(/src="([^"]+)"/); if (srcMatch && srcMatch[1]) videoUrl = srcMatch[1]; }
    if (videoUrl.includes('player.mediadelivery.net') || videoUrl.includes('iframe.mediadelivery.net') || videoUrl.includes('/embed/')) { return <iframe src={videoUrl} loading="lazy" className="absolute top-0 left-0 w-full h-full border-0 rounded-2xl" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen={true} />; }
    return <Player className="absolute top-0 left-0" url={videoUrl} width="100%" height="100%" controls={true} onError={handleVideoError} config={playerConfig} onEnded={handleLessonComplete} />;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center p-4"><div className="bg-red-50 text-red-600 p-8 rounded-2xl font-bold flex flex-col items-center gap-4"><AlertCircle className="w-12 h-12" />{error}<Button onClick={() => navigate('/dashboard')}>العودة</Button></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-in fade-in flex flex-col lg:flex-row gap-6 select-none">
      <main className="flex-1 flex flex-col gap-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 w-fit font-semibold transition-colors">
          <ChevronRight className="w-5 h-5" /> العودة للوحة التحكم
        </button>

        {activeLesson ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeLesson.title}</h1>

            <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-slate-800">
              {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50 text-center px-4">
                  <VideoOff className="w-12 h-12 text-red-500 mb-3" />
                  <p className="text-white font-bold mb-1">عذراً، لا يمكن تشغيل هذا الفيديو!</p>
                  <p className="text-slate-400 text-xs mt-2 max-w-xs leading-relaxed">يرجى التأكد من الرابط أو إعدادات الحماية.</p>
                </div>
              )}
              
              <div className="absolute inset-0">{renderVideoPlayer()}</div>
              <div className="absolute top-0 left-0 w-full h-[60px] bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-auto flex items-start pt-3 px-4" onContextMenu={e => e.preventDefault()}><span className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm border border-slate-800/40">🎥 {activeLesson.title}</span></div>
              <div className="absolute bottom-12 right-0 w-[120px] h-[60px] bg-transparent z-10 pointer-events-auto" onContextMenu={e => e.preventDefault()} />
              <div className="absolute top-0 right-0 w-[150px] h-[100px] bg-transparent z-10 pointer-events-auto" onContextMenu={e => e.preventDefault()} />

              <div className="absolute pointer-events-none transition-all duration-1000 flex flex-col items-center justify-center opacity-30 text-white z-40 bg-black/20 p-2 rounded-lg backdrop-blur-sm" style={{ top: watermarkPos.top, left: watermarkPos.left }}>
                <span className="font-bold text-sm md:text-base">{user?.name}</span>
                <span className="text-xs md:text-sm tracking-wider">{user?.phone}</span>
              </div>
            </div>

            <AdBanner />

            {/* 💡 أزرار التفاعل تحت الفيديو مباشرة */}
            <div className="flex flex-wrap gap-3 mt-2">
              {activeLesson.pdfUrl && <Button onClick={openPdf} variant="outline" className="gap-2 flex-1 sm:flex-none border-blue-200 text-blue-600"><FileText className="w-5 h-5" /> المذكرة (PDF)</Button>}
              {lessonExam && lessonExam.questions?.length > 0 && <Button onClick={() => setIsExamModalOpen(true)} className="gap-2 flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700"><ClipboardList className="w-5 h-5" /> اختبر نفسك</Button>}
              <Button onClick={handleAskQuestion} className="gap-2 flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"><MessageCircle className="w-5 h-5" /> تواصل للاستفسار</Button>
            </div>

            <Card className="mt-6 p-6 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><FileEdit className="w-5 h-5 text-blue-600" /> واجب الدرس</h3>
              {homeworkData?.status === 'graded' ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-2"><CheckCircle2 className="w-5 h-5" /> تم تصحيح الواجب</div>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">الدرجة: <span className="font-extrabold text-lg text-emerald-600">{homeworkData.grade} / 100</span></p>
                  {homeworkData.feedback && <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900 text-sm"><span className="font-bold text-slate-500 block mb-1">ملاحظات الأستاذ:</span>{homeworkData.feedback}</div>}
                  <a href={homeworkData.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold mt-3 inline-block">🔗 عرض حلك</a>
                </div>
              ) : (
                <form onSubmit={handleHomeworkUploadAndSubmit} className="space-y-4">
                  {homeworkData?.status === 'pending' && <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-amber-200 dark:border-amber-800"><Loader2 className="w-4 h-4 animate-spin" /> واجبك قيد المراجعة.</div>}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">اختر ملف الواجب</label>
                    <div className="flex gap-2 items-center">
                      <Input type="file" accept="image/*,application/pdf" onChange={async (e) => { const file = e.target.files?.[0]; if(!file) return; setIsUploadingHw(true); try { const formData = new FormData(); formData.append('file', file); const res = await axios.post('https://abdullah-academy-backend.onrender.com/api/upload', formData); setHomeworkLink(res.data.url); } catch(err) { alert('فشل الرفع'); } finally { setIsUploadingHw(false); } }} className="cursor-pointer p-0 h-auto w-full" />
                      {isUploadingHw && <Loader2 className="w-6 h-6 animate-spin text-blue-600 shrink-0" />}
                    </div>
                    {homeworkLink && <p className="text-xs text-emerald-600 mt-2 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> تم تجهيز الملف</p>}
                  </div>
                  <Button type="submit" disabled={isHwSubmitting || isUploadingHw || !homeworkLink} className="gap-2">{isHwSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />} تسليم الواجب</Button>
                </form>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed border-2"><h2 className="text-xl font-bold text-slate-500">لا يوجد دروس</h2></Card>
        )}
      </main>

      <aside className="w-full lg:w-80 shrink-0">
        <Card className="overflow-hidden sticky top-24">
          <div className="bg-slate-900 text-white p-5">
            <h2 className="font-bold text-lg mb-3 line-clamp-1">{course?.title}</h2>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-1 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-xs text-slate-300 font-bold">{progressPercentage}% مكتمل ({completedLessons.length} من {course?.lessons?.length})</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
            {course?.lessons?.map((lesson: any, index: number) => {
              const isCompleted = completedLessons.includes(lesson._id);
              return (
                <button key={index} onClick={() => setActiveLessonIndex(index)} className={`w-full text-right p-4 rounded-xl flex items-start gap-3 transition-colors ${activeLessonIndex === index ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" /> : <PlayCircle className={`w-5 h-5 shrink-0 mt-0.5 ${activeLessonIndex === index ? 'text-blue-600' : 'text-slate-400'}`} />}
                  <span className={`font-semibold text-sm leading-tight ${isCompleted ? 'text-slate-500 line-through decoration-2' : ''}`}>{index + 1}. {lesson.title}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </aside>

      {isExamModalOpen && lessonExam && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm pointer-events-auto">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
              <div><h2 className="text-xl font-bold text-purple-600 flex items-center gap-2"><ClipboardList className="w-6 h-6" /> {lessonExam.title}</h2><p className="text-sm text-slate-500 mt-1">المدة: {lessonExam.durationInMinutes} دقيقة | النجاح من: {lessonExam.passMark}%</p></div>
              {!examResult && <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold p-2">إغلاق</button>}
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-950">
              {examResult ? (
                <div className="text-center py-10 animate-in zoom-in">
                  {examResult.isPassed ? <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-4" /> : <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />}
                  <h3 className={`text-3xl font-extrabold mb-2 ${examResult.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{examResult.isPassed ? 'نجحت! 🎉' : 'لم تجتز 😔'}</h3>
                  <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">النتيجة: <span className="font-bold">{examResult.score} / {examResult.total}</span></p>
                  <Button onClick={() => setIsExamModalOpen(false)} className="bg-slate-900 text-white px-8">إغلاق</Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {lessonExam.questions.map((q: any, qIndex: number) => (
                    <div key={qIndex} className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl">
                      <h4 className="font-bold mb-4">{qIndex + 1}. {q.questionText}</h4>
                      <div className="space-y-3">
                        {q.options.map((opt: string, optIndex: number) => (
                          <label key={optIndex} className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer">
                            <input type="radio" name={`q-${qIndex}`} checked={answers[qIndex] === optIndex} onChange={() => setAnswers({...answers, [qIndex]: optIndex})} className="w-5 h-5" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleSubmitExam} className="w-full bg-emerald-600 hover:bg-emerald-700">تسليم الإجابات</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};