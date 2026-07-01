import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/Mainlayout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard'; // <-- استدعاء صفحة الأ
import { Courses } from './pages/Courses'; // <--- أضف هذا الاستدعاء
import { CoursePlayer } from './pages/CoursePlayer'; // ضيف السطر ده فوق
import { LandingPage } from './pages/LandingPage';
import { TeacherDashboard } from './pages/TeacherDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/" element={<LandingPage />} />
        <Route element={<MainLayout />}>
        <Route path="/play/:id" element={<CoursePlayer />} />
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} /> {/* <--- أضف هذا المسار */}
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/register" element={<Auth type="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* <-- مسار الأدمن */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}