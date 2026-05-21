import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare2, 
  FileSpreadsheet, Megaphone, CreditCard, 
  LogOut, BookOpen 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminMobileNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate('/portal');
  };

  const getLinks = () => {
    if (role === 'admin') {
      return [
        { name: 'Home', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'Staff', path: '/admin/staff', icon: <UserSquare2 size={20} /> },
        { name: 'Subjects', path: '/admin/subjects', icon: <BookOpen size={20} /> }, // Added
        { name: 'Results', path: '/admin/results', icon: <FileSpreadsheet size={20} /> },
        { name: 'News', path: '/admin/announcements', icon: <Megaphone size={20} /> },
      ];
    } else if (role === 'staff') {
      return [
        { name: 'Home', path: '/staff/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Scores', path: '/staff/results', icon: <FileSpreadsheet size={20} /> },
      ];
    } else {
      return [
        { name: 'Home', path: '/portal/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Results', path: '/portal/results', icon: <FileSpreadsheet size={20} /> },
        { name: 'Fees', path: '/portal/fees', icon: <CreditCard size={20} /> },
      ];
    }
  };

  const links = getLinks();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-1 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-between items-center">
        
        {/* Nav Links */}
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/10 scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {link.icon}
            <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">
              {link.name}
            </span>
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all text-red-500 hover:bg-red-50 active:scale-95"
        >
          <LogOut size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">
            Exit
          </span>
        </button>

      </div>
    </div>
  );
};

export default AdminMobileNav;