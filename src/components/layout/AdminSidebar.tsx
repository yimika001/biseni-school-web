import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare2, 
  FileSpreadsheet, Megaphone, CreditCard, 
  LogOut, GraduationCap, BookOpen 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/portal');
  };

  // Define links based on role
  const getLinks = () => {
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'Staff', path: '/admin/staff', icon: <UserSquare2 size={20} /> },
        { name: 'Subjects', path: '/admin/subjects', icon: <BookOpen size={20} /> }, // Added this line
        { name: 'Results', path: '/admin/results', icon: <FileSpreadsheet size={20} /> },
        { name: 'News', path: '/admin/announcements', icon: <Megaphone size={20} /> },
      ];
    } else if (role === 'staff') {
      return [
        { name: 'Staff Home', path: '/staff/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Upload Scores', path: '/staff/results', icon: <FileSpreadsheet size={20} /> },
      ];
    } else {
      return [
        { name: 'Student Home', path: '/portal/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Check Results', path: '/portal/results', icon: <FileSpreadsheet size={20} /> },
        { name: 'My Fees', path: '/portal/fees', icon: <CreditCard size={20} /> },
      ];
    }
  };

  const links = getLinks();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg text-white">
          < GraduationCap size={24} />
        </div>
        <span className="font-black text-primary tracking-tighter text-xl">BISENI</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-4 tracking-widest">
          {role} Menu
        </p>
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            {link.icon}
            <span className="text-sm">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-gray-50">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'User Account'}</p>
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-3">{role}</p>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;