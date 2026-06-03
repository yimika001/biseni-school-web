import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare2, 
  FileSpreadsheet, Megaphone, 
  LogOut, BookOpen, Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminMobileNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
        { name: 'News', path: '/admin/announcements', icon: <Megaphone size={20} /> },
        { name: 'Subjects', path: '/admin/subjects', icon: <BookOpen size={20} /> },
        { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={20} /> },
        { name: 'Results', path: '/admin/results', icon: <FileSpreadsheet size={20} /> },
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
      ];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Are you sure you want to logout?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-1 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-between items-center">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                  isActive ? 'text-primary bg-primary/10' : 'text-gray-400'
                }`
              }
            >
              {link.icon}
              <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">
                {link.name}
              </span>
            </NavLink>
          ))}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all text-red-500 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">
              Exit
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminMobileNav;