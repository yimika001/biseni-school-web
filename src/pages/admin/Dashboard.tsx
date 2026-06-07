import { useEffect, useState } from 'react';
import { Loader2, Check, Users, UserCheck, AlertTriangle, BookOpen, Lock, Unlock, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StudentHistoryConsole from './StudentHistoryConsole';

const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return <>{parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-yellow-300 font-bold text-black px-1 rounded">{part}</span> : part)}</>;
};

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [termState, setTermState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [editTerm, setEditTerm] = useState({ term: '', session: '' });
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  const fetchData = async () => {
    try {
      const [statsRes, termRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setTermState(termRes.data);
      setEditTerm({ term: termRes.data.term, session: termRes.data.session });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSaveTerm = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/active-term`, editTerm, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessMsg("Updated successfully.");
      setShowSessionModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) { alert("Failed to update"); }
  };

  const toggleTermLock = async () => {
    await axios.patch(`${import.meta.env.VITE_API_URL}/active-term/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setShowLockModal(false);
    await fetchData();
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) return setSearchResults([]);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students?search=${searchQuery.trim()}`, { headers: { Authorization: `Bearer ${token}` } });
      setSearchResults(res.data.students || []);
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {successMsg && <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"><Check size={20} /> <p className="font-bold text-sm">{successMsg}</p></div>}
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
        <button onClick={() => setShowSessionModal(true)} className="bg-white p-4 rounded-3xl border shadow-sm hover:border-indigo-300 transition-all text-left min-w-[200px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
          <p className="text-sm font-black text-slate-800">{termState?.term} Term · {termState?.session}</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
            {termState?.isLocked ? <><Lock size={12} className="text-red-500"/> <span className="text-red-500">Term Locked</span></> : <><Unlock size={12} className="text-green-500"/> <span className="text-green-500">Term Unlocked</span></>}
          </div>
        </button>
      </div>

     {stats && (
  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
    {[
      { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'from-blue-50' },
      { label: 'Total Staff', value: stats.totalStaff, icon: UserCheck, color: 'text-indigo-600', bg: 'from-indigo-50' },
      { label: 'Paid Fees', value: stats.feesOverview.paidCount, icon: Check, color: 'text-emerald-600', bg: 'from-emerald-50' },
      { label: 'Part Payment', value: stats.feesOverview.partPaidCount, icon: AlertTriangle, color: 'text-purple-600', bg: 'from-purple-50' },
      { label: 'Pending Fees', value: stats.feesOverview.pendingCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'from-amber-50' },
      { label: 'Pending Results', value: stats.pendingResults, icon: BookOpen, color: 'text-rose-600', bg: 'from-rose-50' },
    ].map((s, i) => (
      <div key={i} className={`bg-gradient-to-br ${s.bg} to-white p-6 rounded-3xl border shadow-sm`}>
        <s.icon className={`${s.color} mb-2`} size={20} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
        <p className="text-2xl font-black text-slate-900">{s.value}</p>
      </div>
    ))}
  </div>
)}

      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none" />
        <div className="mt-4 space-y-2">
          {searchResults.map(s => {
            const fullName = `${s.surname || ''} ${s.firstName || ''} ${s.middleName || ''}`.trim();
            return (
              <button key={s._id} onClick={() => setSelectedStudentId(s._id)} className="w-full p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl flex justify-between items-center text-left">
                <p className="font-bold text-slate-700"><HighlightText text={fullName} query={searchQuery} /></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.class}</p>
              </button>
            );
          })}
        </div>
      </div>

      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-4 relative">
            <button onClick={() => setShowSessionModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 transition-colors"><X size={24}/></button>
            <h3 className="font-black text-lg">Manage Session</h3>
            <select className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={editTerm.term} onChange={e => setEditTerm({...editTerm, term: e.target.value})}>
              <option value="First">First Term</option><option value="Second">Second Term</option><option value="Third">Third Term</option>
            </select>
            <input className="w-full p-3 bg-slate-100 rounded-xl font-bold" value={editTerm.session} onChange={e => setEditTerm({...editTerm, session: e.target.value})} />
            <button onClick={handleSaveTerm} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Save Changes</button>
            <button onClick={() => {setShowSessionModal(false); setShowLockModal(true)}} className="w-full py-3 bg-slate-100 rounded-xl font-bold">{termState?.isLocked ? 'Unlock Term' : 'Lock Term'}</button>
          </div>
        </div>
      )}

      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
            <h3 className="font-black text-lg">Confirm Action</h3>
            <p className="text-sm my-4">{termState?.isLocked ? 'Unlock term for uploads?' : 'Lock term to restrict uploads?'}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLockModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
              <button onClick={toggleTermLock} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {selectedStudentId && <StudentHistoryConsole studentId={selectedStudentId} adminToken={token!} highlightQuery={searchQuery} />}
    </div>
  );
};
export default Dashboard;