import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import FeesStatus from './pages/portal/Fees';

// Public Pages
import Home from './pages/public/home'; 
import About from './pages/public/About';
import Academics from './pages/public/Academics';
import Admissions from './pages/public/Admissions';
import News from './pages/public/News';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import ScrollToTop from './components/ScrollToTop';

// Admin & Staff Components
import AdminSidebar from './components/layout/AdminSidebar';
import AdminMobileNav from './components/layout/AdminMobileNav';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Staff from './pages/admin/Staff';
import AdminResults from './pages/admin/result'; // Admin: approve/reject/term settings/history
import StaffResults from './pages/portal/StaffResults'; // Staff: upload only
import Announcements from './pages/admin/Announcements';
import StaffDashboard from './pages/portal/StaffDashboard';
import StudentDashboard from './pages/portal/StudentDashboard';
import StudentResults from './pages/portal/Results';
import SubjectManagement from './pages/admin/SubjectManagement';

const App = () => {
  return (
    <AuthProvider>
      <Router basename="/biseni_secondary_school">
        <ScrollToTop />
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/news" element={<News />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/portal" element={<Login />} />
          </Route>

          {/* 2. ADMIN PORTAL ROUTES */}
          <Route path="/admin/*" element={
            <div className="flex bg-gray-50 min-h-screen">
              <AdminSidebar />
              <AdminMobileNav />
              <div className="flex-1 overflow-y-auto h-screen pb-20 md:pb-0">
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="students" element={<Students />} />
                  <Route path="staff" element={<Staff />} />
                  <Route path="results" element={<AdminResults />} />
                  <Route path="announcements" element={<Announcements />} />
                 <Route path="subjects" element={<SubjectManagement />} />
                </Routes>
              </div>
            </div>
          } />

          {/* 3. STAFF PORTAL ROUTES */}
          <Route path="/staff/*" element={
            <div className="flex bg-gray-50 min-h-screen">
              <AdminSidebar />
              <AdminMobileNav />
              <div className="flex-1 p-0 overflow-y-auto h-screen pb-20 md:pb-0">
                <Routes>
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="results" element={<StaffResults />} />
                </Routes>
              </div>
            </div>
          } />

          {/* 4. STUDENT PORTAL ROUTES */}
          <Route path="/portal/*" element={
            <div className="flex bg-gray-50 min-h-screen">
              <AdminSidebar />
              <AdminMobileNav />
              <div className="flex-1 overflow-y-auto h-screen pb-20 md:pb-0">
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="results" element={<StudentResults />} />
                  <Route path="fees" element={<FeesStatus />} />
                </Routes>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;