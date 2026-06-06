import { useEffect, useState } from 'react';
import { Settings, Lock, Unlock, Loader2, Search, Check, Users, UserCheck, DollarSign, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StudentHistoryConsole from './StudentHistoryConsole';

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  pendingResults: number;
  totalAnnouncements: number;
  feesOverview: { paid: number; pending: number; };
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
  middleName?: string;
  admissionNumber: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [termState, setTermState] = useState<ActiveTermState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockToggleLoading, setLockToggleLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { token, user } = useAuth();
  
  const [showLockModal, setShowLockModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newSession, setNewSession] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const currentRole = user?.role?.toLowerCase() || '';

  const triggerSuccess = (message: string) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Highlight helper
  const HighlightText = ({ text, query }: { text: string, query: string }) => {
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-yellow-300 font-bold text-black">{part}</span> 
            : part
        )}
      </>
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, termRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setTermState(termRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

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
        setSearchResults(Array.isArray(response.data) ? response.data : response.data.students || []);
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
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/active-term/toggle-lock`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTermState(res.data.activeTerm || res.data);
      setShowLockModal(false);
      triggerSuccess("Status updated successfully.");
    } finally { setLockToggleLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={36} /></div>;

  return (
    <div className="p-6 md:p-8 pb-24 max-w-7xl mx-auto space-y-8">
      {successMsg && <div className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"><Check size={20} /> <p className="font-bold text-sm">{successMsg}</p></div>}

      {/* Header & Term Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'Administrator'}</p>
        </div>
        {termState && (
          <div className="bg-white border p-4 rounded-xl flex items-center justify-between min-w-[300px]">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Session</p>
              <p className="text-sm font-bold text-gray-900">{termState.term} Term · {termState.session}</p>
            </div>
            <button onClick={() => setShowLockModal(true)} className={`p-3 rounded-lg ${termState.isLocked ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {termState.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600' },
            { label: 'Total Staff', value: stats.totalStaff, icon: UserCheck, color: 'text-indigo-600' },
            { label: 'Pending Fees', value: `₦${stats.feesOverview.pending.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600' },
            { label: 'Pending Results', value: stats.pendingResults, icon: BookOpen, color: 'text-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 bg-gray-50 rounded-lg ${stat.color}`}><stat.icon size={18} /></div>
                <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Search size={18} /> Student Records</h3>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or admission ID..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
        
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map(s => (
              <button key={s._id} onClick={() => setSelectedStudentId(s._id)} className="w-full p-4 bg-white border border-gray-100 rounded-xl flex justify-between hover:border-indigo-200 transition-all">
                <span className="font-semibold text-sm">
                  <HighlightText text={`${s.lastName}, ${s.firstName} ${s.middleName || ''}`} query={searchQuery} />
                </span>
                <span className="text-[10px] font-mono font-bold bg-gray-100 px-2 py-1 rounded">{s.admissionNumber}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History Console */}
      {selectedStudentId && (
        <div className="bg-white rounded-2xl border shadow-sm p-2">
          <StudentHistoryConsole studentId={selectedStudentId} adminToken={token!} />
          <button onClick={() => setSelectedStudentId(null)} className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-600">Close Viewer</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;