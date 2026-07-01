import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, FunctionSquare, ChevronRight, MonitorPlay, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-700">
      <style>
        {`
          .animate-float { animation: float 6s ease-in-out infinite; }
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
          }
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}
      </style>
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:px-8 overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950"></div>
        
        <div className="absolute top-20 left-10 text-blue-600/10 dark:text-blue-400/10 animate-float" style={{ animationDelay: '0s' }}>
          <Calculator size={120} />
        </div>
        <div className="absolute bottom-20 right-10 text-indigo-600/10 dark:text-indigo-400/10 animate-float" style={{ animationDelay: '2s' }}>
          <FunctionSquare size={100} />
        </div>

        <div className="mx-auto max-w-4xl text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            التسجيل متاح الآن لدفعة 2026
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl mb-6 leading-tight">
            أكاديمية <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 animate-gradient-x">عبدالله عارف</span> للرياضيات
          </h1>
          <p className="mt-6 text-xl leading-8 text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            منصتك التعليمية المتكاملة لفهم الرياضيات بأسلوب عصري، تدريبات مستمرة، امتحانات دورية، ومتابعة دقيقة.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate('/register')} className="text-lg px-8 py-7 w-full sm:w-auto shadow-blue-500/25 shadow-xl hover:scale-105">
              ابدأ رحلتك الآن <ChevronRight className="mr-2 h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="text-lg px-8 py-7 w-full sm:w-auto">
              تصفح الكورسات
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center mb-16 text-slate-900 dark:text-white">لماذا تختار منصتنا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MonitorPlay, title: 'محاضرات مسجلة عالية الجودة', desc: 'شاهد الدروس في أي وقت وبأعلى جودة مع توفر ملخصات PDF.' },
              { icon: CheckCircle, title: 'امتحانات وتقييم مستمر', desc: 'اختبر نفسك بعد كل درس وتعرف على مستواك الحقيقي فوراً.' },
              { icon: Clock, title: 'متابعة دورية وواجبات', desc: 'نظام متكامل لتسليم الواجبات ومتابعة أدائك طوال العام.' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 text-center border-t-4 border-t-blue-600 group cursor-default">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};