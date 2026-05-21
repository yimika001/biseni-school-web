import { useEffect, useState } from 'react';
import { Users, UserCheck, Bell, FileText, LogOut, Lock, Unlock, Loader2, Search, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentHistoryConsole from './StudentHistoryConsole';

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  pendingResults: number;
  totalAnnouncements: number;
  feesOverview: {
    paid: number;
    pending: number;
  };
}

interface ActiveTermState {
  _id: string;
  term: string;
  session: string;
  isLocked: boolean;
}

interface StudentSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  isActive: boolean;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [termState, setTermState] = useState<ActiveTermState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockToggleLoading, setLockToggleLoading] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // --- STUDENT HISTORY SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Unified fetch for core metrics and active term context
  const fetchData = async () => {
    try {
      const [statsRes, termRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/active-term`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(statsRes.data);
      setTermState(termRes.data);
    } catch (error) {
      console.error('Failed to fetch administrative data context:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // --- LIVE MULTI-PROPERTY LOOKUP SYSTEM ---
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/students`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            params: {
              search: searchQuery.trim(),
              _t: Date.now()
            }
          }
        );
        
        setSearchResults(response.data.students || response.data);
      } catch (err) {
        console.error('Error executing student history search query:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  const openHistoryModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleToggleTermLock = async () => {
    if (!termState) return;
    
    const confirmAction = window.confirm(
      termState.isLocked 
        ? "Are you sure you want to UNLOCK result uploads? Teachers will be able to edit and upload scores again." 
        : "Are you sure you want to LOCK result uploads? This will finalize all current scores and update staff workspaces."
    );

    if (!confirmAction) return;

    try {
      setLockToggleLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/active-term/toggle-lock`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTermState(response.data.activeTerm || response.data);
      await fetchData();
    } catch (error) {
      alert("Failed to modify system locking configuration. Please review your active terminal model state.");
    } finally {
      setLockToggleLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/portal');
  };

  const statCards = [
    {
      label: 'Total Students',
      value: loading ? '...' : stats?.totalStudents ?? 0,
      icon: <Users className="text-blue-600" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Academic Staff',
      value: loading ? '...' : stats?.totalStaff ?? 0,
      icon: <UserCheck className="text-green-600" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Active Notices',
      value: loading ? '...' : stats?.totalAnnouncements ?? 0,
      icon: <Bell className="text-orange-600" />,
      bg: 'bg-orange-50',
    },
    {
      label: 'Pending Results',
      value: loading ? '...' : stats?.pendingResults ?? 0,
      icon: <FileText className="text-purple-600" />,
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-8">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
        <span className="font-bold text-primary text-sm uppercase tracking-widest">Admin Portal</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
        >
          <LogOut size={12} /> Exit
        </button>
      </div>

      {/* Header and Live Status Module */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrative Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, Admin. Here is what's happening at Biseni Secondary today.
          </p>
        </div>

        {termState && (
          <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 shadow-sm p-4 rounded-xl min-w-70">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Current Session Context</span>
              <h4 className="text-xs font-bold text-gray-900 uppercase mt-0.5">
                {termState.term} Term · {termState.session}
              </h4>
              <p className="text-[10px] font-semibold mt-1">
                Status: <span className={termState.isLocked ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                  {termState.isLocked ? "🔒 Locked" : "🔓 Open For Uploads"}
                </span>
              </p>
            </div>
            
            <button
              disabled={lockToggleLoading}
              onClick={handleToggleTermLock}
              className={`flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-lg transition-all shadow-sm uppercase tracking-wider select-none ${
                termState.isLocked 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {lockToggleLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : termState.isLocked ? (
                <>
                  <Unlock size={14} /> Open
                </>
              ) : (
                <>
                  <Lock size={14} /> Lock Term
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* --- RECONSTRUCTED STUDENT HISTORY REGION --- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Student History</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Search and inspect complete historical score records and performance metrics for active students and alumni.</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {isSearching ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Search size={18} className="text-slate-400" />}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student history by name or admission number..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Search Dropdown Panel displaying backend data */}
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto shadow-md bg-white mt-2 relative z-10">
            {searchResults.map((student) => (
              <div 
                key={student._id} 
                onClick={() => openHistoryModal(student._id)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${student.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                      Admission Number: <span className="font-mono text-slate-700 font-black">{student.admissionNumber}</span> · Class: <span className="text-slate-700 font-black">{student.class}</span>
                    </p>
                  </div>
                </div>
                
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  student.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {student.isActive ? 'Active' : 'Alumni'}
                </span>
              </div>
            ))}
          </div>
        )}

        {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Search size={16} />
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              No institutional records found matching <span className="font-bold underline">"{searchQuery}"</span>. Please verify the surname, first name, or admission number and try again.
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fees Overview */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Fees Paid</p>
            <p className="text-3xl font-black text-green-700">{stats.feesOverview.paid}</p>
            <p className="text-xs text-green-500 mt-1">Students who have cleared fees</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Fees Pending</p>
            <p className="text-3xl font-black text-red-700">{stats.feesOverview.pending}</p>
            <p className="text-xs text-red-500 mt-1">Students with outstanding fees</p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800">Recent System Activity</h2>
        </div>
        <div className="p-5 text-center text-gray-400 py-12">
          {loading ? (
            <p>Loading activity...</p>
          ) : (
            <p>No recent logs to display. Everything is running smoothly.</p>
          )}
        </div>
      </div>

      {/* --- FLOATING ARCHIVAL MODAL LIGHTBOX OVERLAY --- */}
      {isModalOpen && selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setSelectedStudentId(null);
              }}
              className="absolute top-6 right-6 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all uppercase tracking-wide select-none z-50"
            >
              ✕ Close Archive
            </button>
            <div className="pt-6">
              <StudentHistoryConsole studentId={selectedStudentId} adminToken={token || ''} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;