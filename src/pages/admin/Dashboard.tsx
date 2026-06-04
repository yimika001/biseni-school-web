import { useEffect, useState } from 'react';
import { Users, UserCheck, Bell, FileText, Settings, Lock, Unlock, Loader2, Search, GraduationCap, BookOpen, Award, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StudentHistoryConsole from './StudentHistoryConsole';

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 font-black px-0.5 rounded">{part}</span>
        ) : (part)
      )}
    </span>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [termState, setTermState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lockToggleLoading, setLockToggleLoading] = useState(false);
  const { token, user } = useAuth();
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newSession, setNewSession] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentRole = user?.role?.toLowerCase() || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [termRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } }),
        currentRole === 'admin' ? axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: null })
      ]);
      setTermState(termRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchData(); }, [token, user?.role]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.length < 2 || !token) { setSearchResults([]); return; }
      try {
        setIsSearching(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/students?search=${searchQuery}`, { headers: { Authorization: `Bearer ${token}` } });
        setSearchResults(res.data.students || res.data);
      } finally { setIsSearching(false); }
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery, token]);

  const handleUpdateContext = async () => {
    setIsUpdating(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/active-term`, { term: newTerm, session: newSession }, { headers: { Authorization: `Bearer ${token}` } });
      setTermState(res.data.activeTerm || res.data);
      setShowConfigModal(false);
    } catch { alert("Update failed"); } finally { setIsUpdating(false); }
  };

  const handleToggleLock = async () => {
    try {
      setLockToggleLoading(true);
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/active-term/toggle-lock`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTermState(res.data.activeTerm || res.data);
    } catch { alert("Lock toggle failed"); } finally { setLockToggleLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Unified Configuration & Lock Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border">
            <div className="flex justify-between mb-6"><h3 className="font-black text-lg">Academic Settings</h3><button onClick={() => setShowConfigModal(false)}><X size={20}/></button></div>
            <input className="w-full p-3 mb-3 bg-gray-50 border rounded-xl font-semibold" value={newTerm} onChange={e => setNewTerm(e.target.value)} placeholder="Term" />
            <input className="w-full p-3 mb-6 bg-gray-50 border rounded-xl font-semibold" value={newSession} onChange={e => setNewSession(e.target.value)} placeholder="Session" />
            <button onClick={handleUpdateContext} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl mb-8">{isUpdating ? "Saving..." : "Save Changes"}</button>
            <div className="border-t pt-6">
                <button onClick={handleToggleLock} disabled={lockToggleLoading} className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl ${termState?.isLocked ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {lockToggleLoading ? <Loader2 className="animate-spin" /> : termState?.isLocked ? <><Unlock size={18}/> Unlock System</> : <><Lock size={18}/> Lock System</>}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Administrative Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back, Admin.</p>
        </div>
        {currentRole === 'admin' && termState && (
          <div onClick={() => { setNewTerm(termState.term); setNewSession(termState.session); setShowConfigModal(true); }} className="bg-white p-4 rounded-xl border cursor-pointer hover:border-indigo-400 transition-all shadow-sm min-w-[240px]">
            <span className="text-[10px] font-black uppercase text-gray-400">Current Academic Context</span>
            <h4 className="text-sm font-black text-gray-900">{termState.term} Term · {termState.session}</h4>
            <p className="text-[10px] font-bold text-gray-500">Status: {termState.isLocked ? "🔒 Locked" : "🔓 Open"}</p>
          </div>
        )}
      </div>

      {/* Grid Stats */}
      {currentRole === 'admin' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Academic Staff', value: stats.totalStaff, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Active Notices', value: stats.totalAnnouncements, icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Pending Results', value: stats.pendingResults, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${s.bg}`}><s.icon className={s.color} /></div>
              <div><p className="text-xs font-bold text-gray-400">{s.label}</p><p className="text-xl font-black">{s.value}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Student History Console */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div><h2 className="text-lg font-black text-slate-800 uppercase">Student History Console</h2></div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">{isSearching ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Search size={18} className="text-slate-400" />}</div>
          <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-semibold" placeholder="Search by name or admission number..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        {searchResults.length > 0 && (
          <div className="border rounded-xl divide-y overflow-hidden">
            {searchResults.map(s => (
              <div key={s._id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStudentId(s._id); setIsModalOpen(true); }}>
                <p className="font-bold text-sm">{s.firstName} {s.lastName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><X /></button>
            <StudentHistoryConsole studentId={selectedStudentId} adminToken={token || ''} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;