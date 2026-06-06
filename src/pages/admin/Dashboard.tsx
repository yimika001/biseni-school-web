import { useEffect, useState } from 'react';
import { Lock, Unlock, Loader2, Search, Check, Users, UserCheck, AlertTriangle, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StudentHistoryConsole from './StudentHistoryConsole';

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  pendingResults: number;
  feesOverview: { paid: number; pendingCount: number };
}

interface ActiveTermState {
  term: string;
  session: string;
  isLocked: boolean;
}

// Helper component for highlighting text
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <>{text}</>;
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

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [termState, setTermState] = useState<ActiveTermState | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { token, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, termRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setTermState(termRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) return setSearchResults([]);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students?search=${searchQuery.trim()}`, 
        { headers: { Authorization: `Bearer ${token}` } });
      setSearchResults(res.data.students || res.data || []);
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {successMsg && <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"><Check size={20} /> <p className="font-bold text-sm">{successMsg}</p></div>}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium">Overview of your academic environment.</p>
        </div>
        {termState && (
          <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-2xl border shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
              <p className="text-sm font-black text-slate-800">{termState.term} Term · {termState.session}</p>
            </div>
            {termState.isLocked ? <Lock className="text-rose-500" size={18} /> : <Unlock className="text-emerald-500" size={18} />}
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600' },
            { label: 'Total Staff', value: stats.totalStaff, icon: UserCheck, color: 'text-indigo-600' },
            { label: 'Pending Fees', value: stats.feesOverview.pendingCount, icon: AlertTriangle, color: 'text-amber-600' },
            { label: 'Pending Results', value: stats.pendingResults, icon: BookOpen, color: 'text-rose-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all">
              <s.icon className={`${s.color} mb-4`} size={24} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search by name or admission ID..." 
            className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map(s => (
              <button key={s._id} onClick={() => setSelectedStudentId(s._id)} className="w-full p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl flex justify-between items-center transition-all">
                <span className="font-bold text-slate-700">
                  <HighlightText text={`${s.lastName?.toUpperCase()}, ${s.firstName} ${s.middleName || ''}`} query={searchQuery} />
                </span>
                <span className="text-[10px] font-mono bg-white px-3 py-1 rounded-full border">{s.admissionNumber}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedStudentId && (
        <div className="bg-white rounded-3xl border shadow-sm p-2">
          <StudentHistoryConsole studentId={selectedStudentId} adminToken={token!} highlightQuery={searchQuery} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;