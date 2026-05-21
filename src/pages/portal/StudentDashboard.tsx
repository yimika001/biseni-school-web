import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CreditCard, LogOut, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  department: string;
  feesStatus: 'Paid' | 'Pending' | 'Part-Payment';
}

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(meRes.data.profile);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/portal');
  };

  const getFeesStyle = (status: string) => {
    switch (status) {
      case 'Paid': return { label: 'CLEARED', sub: 'No Balance', bg: 'bg-accent' };
      case 'Pending': return { label: 'PENDING', sub: 'Payment Required', bg: 'bg-red-500' };
      case 'Part-Payment': return { label: 'PARTIAL', sub: 'Balance Remaining', bg: 'bg-orange-500' };
      default: return { label: 'UNKNOWN', sub: '', bg: 'bg-gray-400' };
    }
  };

  const feesInfo = getFeesStyle(profile?.feesStatus || '');

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Hi, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-500 font-medium italic hidden md:block text-sm">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 active:scale-95 transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Student Identity Card */}
      <div className="mb-8">
        {loading ? (
          <div className="bg-white h-20 w-full animate-pulse rounded-2xl border border-gray-100" />
        ) : profile ? (
          <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 text-primary rounded-2xl flex items-center justify-center font-black text-xl">
                {profile.class}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Student</p>
                <p className="text-lg font-black text-gray-800 uppercase">{profile.lastName} {profile.firstName}</p>
                <div className="flex gap-3 items-center">
                   <p className="text-xs text-primary font-bold">{profile.admissionNumber}</p>
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <p className="text-xs font-bold text-gray-500">{profile.department} Department</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-gray-200"
            >
              School News <ExternalLink size={12} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Results Card */}
        <div
          onClick={() => navigate('/portal/results')}
          className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group cursor-pointer min-h-55 flex flex-col justify-between"
        >
          <BookOpen className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <p className="text-xs font-bold uppercase opacity-80 mb-1 tracking-widest">Academic Records</p>
            <h3 className="text-4xl font-black italic">Check<br/>Results</h3>
          </div>
          <div className="flex justify-between items-end">
             <p className="text-xs bg-white/20 px-4 py-2 rounded-xl font-bold backdrop-blur-sm">
                View Terminal Reports
             </p>
             <div className="bg-white text-primary p-2 rounded-full">
                <ExternalLink size={20} />
             </div>
          </div>
        </div>

        {/* Fees Card */}
        <div
          onClick={() => navigate('/portal/fees')}
          className={`${feesInfo.bg} p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer min-h-55 flex flex-col justify-between`}
        >
          <CreditCard className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <div>
            <p className="text-xs font-bold uppercase opacity-80 mb-1 tracking-widest">Financial Status</p>
            <h3 className="text-4xl font-black italic">
              {loading ? '...' : feesInfo.label}
            </h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-xs bg-white/20 px-4 py-2 rounded-xl font-bold backdrop-blur-sm">
              {feesInfo.sub}
            </p>
             <div className="bg-white text-gray-800 p-2 rounded-full">
                <ExternalLink size={20} />
             </div>
          </div>
        </div>

      </div>

      {/* Quick Info Bar */}
      <div className="mt-8 bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-6 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Need help? Visit the admin office for password resets or fee reconciliation.
        </p>
      </div>

    </div>
  );
};

export default StudentDashboard;