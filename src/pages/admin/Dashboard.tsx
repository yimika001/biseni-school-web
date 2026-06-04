import { useEffect, useState } from 'react';
import { Users, UserCheck, Bell, FileText, Settings, Lock, Unlock, Loader2, Search, GraduationCap, BookOpen, Award, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import StudentHistoryConsole from './StudentHistoryConsole';

// Helper component for text highlighting
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 font-black px-0.5 rounded">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

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
  const [isUpdating, setIsUpdating] = useState(false);
  const { token, user } = useAuth();
  
  const [showLockModal, setShowLockModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newSession, setNewSession] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentRole = user?.role?.toLowerCase() || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      if (currentRole === 'admin') {
        const [statsRes, termRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        setTermState(termRes.data);
      } else {
        const termRes = await axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } });
        setTermState(termRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data context:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, user?.role]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2 || !token) {
        setSearchResults([]);
        return;
      }
      try {
        setIsSearching(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/students`, { 
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchQuery.trim() }
        });
        const data = response.data.students || response.data;
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error executing student history search query:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  const handleToggleTermLock = async () => {
    if (!termState) return;
    try {
      setLockToggleLoading(true);
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/active-term/toggle-lock`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTermState(response.data.activeTerm || response.data);
      setShowLockModal(false);
    } catch (error) {
      alert("Failed to modify system locking configuration.");
    } finally {
      setLockToggleLoading(false);
    }
  };

  const handleUpdateTerm = async () => {
    if (!termState) return;
    try {
      setIsUpdating(true);
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/active-term`, 
        { term: newTerm, session: newSession }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTermState(response.data.activeTerm || response.data);
      setShowConfigModal(false);
    } catch (error) {
      alert("Failed to update term/session.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Synchronizing Portal...</p>
        </div>
      </div>
    );
  }

  if (currentRole === 'student') {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name || 'Student'}. Check your academic status below.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-50 text-blue-600"><BookOpen /></div><div><p className="text-sm font-medium text-gray-500">Registered Courses</p><p className="text-2xl font-bold text-gray-900">Active</p></div></div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"><div className="p-3 rounded-lg bg-green-50 text-green-600"><Award /></div><div><p className="text-sm font-medium text-gray-500">Term Results</p><p className="text-2xl font-bold text-gray-900">Published</p></div></div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"><div className="p-3 rounded-lg bg-purple-50 text-purple-600"><CheckCircle /></div><div><p className="text-sm font-medium text-gray-500">Attendance Rate</p><p className="text-2xl font-bold text-gray-900">--</p></div></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"><h3 className="text-lg font-bold text-gray-800 mb-4">Your Academic Records</h3><StudentHistoryConsole studentId={user?.id || ''} adminToken={token || ''} /></div>
      </div>
    );
  }

  if (currentRole === 'staff' || currentRole === 'teacher') {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1><p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name || 'Instructor'}. Access your assigned classrooms and grading rosters.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"><div className="p-3 rounded-lg bg-indigo-50 text-indigo-600"><Users /></div><div><p className="text-sm font-medium text-gray-500">Assigned Classes</p><p className="text-2xl font-bold text-gray-900">View Roster</p></div></div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"><div className="p-3 rounded-lg bg-orange-50 text-orange-600"><FileText /></div><div><p className="text-sm font-medium text-gray-500">Result Input Status</p><p className="text-2xl font-bold text-gray-900">{termState?.isLocked ? "🔒 Uploads Locked" : "🔓 Open for Entry"}</p></div></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Academic Staff', value: stats?.totalStaff ?? 0, icon: <UserCheck className="text-green-600" />, bg: 'bg-green-50' },
    { label: 'Active Notices', value: stats?.totalAnnouncements ?? 0, icon: <Bell className="text-orange-600" />, bg: 'bg-orange-50' },
    { label: 'Pending Results', value: stats?.pendingResults ?? 0, icon: <FileText className="text-purple-600" />, bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-8">
      {/* Modals */}
      {showLockModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to {termState?.isLocked ? "UNLOCK" : "LOCK"} result uploads?</p>
            <div className="flex gap-3"><button onClick={() => setShowLockModal(false)} className="flex-1 py-2.5 bg-gray-100 font-bold text-gray-700 rounded-xl">Cancel</button><button onClick={handleToggleTermLock} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">Confirm</button></div>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">Update Session Context</h3>
            <div className="space-y-4 mb-6">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Term</label><select value={newTerm} onChange={(e) => setNewTerm(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"><option value="First">First</option><option value="Second">Second</option><option value="Third">Third</option></select></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Session</label><input type="text" value={newSession} onChange={(e) => setNewSession(e.target.value)} placeholder="2025/2026" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold" /></div>
            </div>
            <div className="flex gap-3"><button onClick={() => setShowConfigModal(false)} className="flex-1 py-2.5 bg-gray-100 font-bold text-gray-700 rounded-xl">Cancel</button><button onClick={handleUpdateTerm} disabled={isUpdating} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">{isUpdating ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Save Changes"}</button></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Administrative Overview</h1><p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here is what's happening today.</p></div>
        {termState && (
          <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 shadow-sm p-4 rounded-xl min-w-[320px]">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Current Session Context</span>
              <div className="flex items-center gap-2 mt-0.5"><h4 className="text-xs font-bold text-gray-900 uppercase">{termState.term} Term · {termState.session}</h4><button onClick={() => { setNewTerm(termState.term); setNewSession(termState.session); setShowConfigModal(true); }} className="text-indigo-600 hover:text-indigo-800"><Settings size={14} /></button></div>
              <p className="text-[10px] font-semibold mt-1">Status: <span className={termState.isLocked ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{termState.isLocked ? "🔒 Locked" : "🔓 Open"}</span></p>
            </div>
            <button disabled={lockToggleLoading} onClick={() => setShowLockModal(true)} className={`flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-lg transition-all shadow-sm uppercase tracking-wider ${termState.isLocked ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"}`}>{lockToggleLoading ? <Loader2 size={14} className="animate-spin" /> : termState.isLocked ? <Unlock size={14} /> : <Lock size={14} />}</button>
          </div>
        )}
      </div>

      {/* Student History Console */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div><h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Student History Console</h2><p className="text-xs text-slate-500 mt-0.5 font-medium">Search and inspect complete performance metrics and scores across all active terms.</p></div>
        <div className="relative"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">{isSearching ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Search size={18} className="text-slate-400" />}</div><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search student history by name or admission number..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800" /></div>
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto shadow-md bg-white mt-2 relative z-10">
            {searchResults.map((student) => (
              <div key={student._id} onClick={() => { setSelectedStudentId(student._id); setIsModalOpen(true); }} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-all group">
                <div className="flex items-center gap-3"><div className={`p-2.5 rounded-xl ${student.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}><GraduationCap size={20} /></div><div><p className="text-sm font-black text-slate-800"><HighlightText text={`${student.firstName} ${student.lastName}`} highlight={searchQuery} /></p><p className="text-[11px] text-slate-500 font-bold mt-0.5">Admission Number: <span className="font-mono text-slate-700 font-black">{student.admissionNumber}</span> · Class: <span className="text-slate-700 font-black">{student.class}</span></p></div></div>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${student.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{student.isActive ? 'Active' : 'Alumni'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"><div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div><div><p className="text-sm font-medium text-gray-500">{stat.label}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div></div>
        ))}
      </div>

      {/* Financials */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6"><p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Fees Paid</p><p className="text-3xl font-black text-green-700">{stats.feesOverview.paid}</p></div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-6"><p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Fees Pending</p><p className="text-3xl font-black text-red-700">{stats.feesOverview.pending}</p></div>
        </div>
      )}

      {isModalOpen && selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 pt-6">
            <button onClick={() => { setIsModalOpen(false); setSelectedStudentId(null); setSearchQuery(''); setSearchResults([]); }} className="absolute top-6 right-6 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm z-50">✕ Close Archive</button>
            <StudentHistoryConsole studentId={selectedStudentId} adminToken={token || ''} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;