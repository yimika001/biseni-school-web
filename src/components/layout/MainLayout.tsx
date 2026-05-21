import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        {/* This renders the specific page (Home, About, etc.) */}
        <Outlet />
      </main>
      <footer className="bg-primary-dark text-white py-10 border-t-4 border-accent">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-bold text-xl text-accent uppercase">Biseni Secondary School</h2>
          <p className="text-sm mt-2 opacity-90">Bayelsa State, Nigeria</p>
          <div className="mt-6 pt-6 border-t border-white/10 text-xs opacity-60">
            © {new Date().getFullYear()} All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;