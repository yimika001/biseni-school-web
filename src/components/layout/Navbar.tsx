import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const activeLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-bold transition-colors duration-200 py-1 border-b-2 ${
      isActive ? 'border-accent text-accent' : 'border-transparent text-white hover:text-accent'
    }`;

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-full border-2 border-accent transition-transform group-hover:scale-105">
              <GraduationCap className="text-primary w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl tracking-tight uppercase leading-none">B.S.S</span>
              <span className="text-accent text-xs font-semibold tracking-widest uppercase">Bayelsa State, Nigeria</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={activeLinkStyle}>
                {link.name}
              </NavLink>
            ))}
            {!isAuthenticated ? (
              <Link to="/portal" className="bg-accent hover:bg-accent-hover text-primary-dark px-6 py-2.5 rounded-md font-bold text-sm transition-all">
                School Portal
              </Link>
            ) : (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold">
                Logout
              </button>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-all"
            style={{ background: isOpen ? 'rgba(255,255,255,0.15)' : 'transparent' }}
          >
            <div className={`transition-all duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[54] transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Panel — from LEFT */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm z-[55] flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0a3d1f' }}
      >
        {/* Panel Header */}
<div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
  <div className="flex items-center gap-3">
    <div className="bg-white p-2 rounded-full border-2 border-accent">
      <GraduationCap className="text-primary w-6 h-6" />
    </div>
    <div>
      <p className="font-black text-sm uppercase tracking-tight text-white leading-none">B.S.S</p>
      <p className="text-accent text-[9px] font-bold tracking-widest uppercase mt-0.5">Bayelsa State</p>
    </div>
  </div>
  <button
    onClick={() => setIsOpen(false)}
    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/20"
    style={{ background: 'rgba(255,255,255,0.1)' }}
  >
    <X size={16} />
  </button>
</div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-4 rounded-xl font-bold text-base transition-all ${
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span>{link.name}</span>
              <ChevronRight size={16} className="opacity-50" />
            </NavLink>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="px-4 pb-8 pt-4 border-t border-white/10 space-y-3">
          {!isAuthenticated ? (
            <Link
              to="/portal"
              className="flex items-center justify-center w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
              style={{ background: '#D4AF37', color: '#0a3d1f' }}
              onClick={() => setIsOpen(false)}
            >
              Access School Portal
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white transition-all"
            >
              Logout
            </button>
          )}
          <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Biseni Secondary School · Kalama, Bayelsa
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;