import { useEffect, useState } from 'react';
import { Lock, Unlock, Loader2, Search, Check, Users, UserCheck, AlertTriangle, BookOpen, Save, CreditCard, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StudentHistoryConsole from './StudentHistoryConsole';

const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>{parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-yellow-300 font-bold text-black px-1 rounded">{part}</span> : part)}</>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [termState, setTermState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editTerm, setEditTerm] = useState({ term: '', session: '' });
  const { token } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

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
      setSuccessMsg("Session updated successfully");
      fetchData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) { alert("Failed to update session"); }
  };

  const toggleTermLock = async () => {
    await axios.patch(`${import.meta.env.VITE_API_URL}/active-term/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setSuccessMsg(`Term successfully ${termState.isLocked ? 'unlocked' : 'locked'}.`);
    setShowModal(false);
    fetchData();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) return setSearchResults([]);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/students?search=${searchQuery.trim()}`, { headers: { Authorization: `Bearer ${token}` } });
      setSearchResults(res.data.students || res.data || []);
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {successMsg && <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"><Check size={20} /> <p className="font-bold text-sm">{successMsg}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
        </div>
        <div className="bg-white p-4 rounded-3xl border shadow-sm">
          <button onClick={() => setShowSessionForm(!showSessionForm)} className="w-full text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
            <p className="text-sm font-black text-slate-800">{termState?.term} Term · {termState?.session}</p>
          </button>
          
          {showSessionForm && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex gap-2">
                <input className="flex-1 p-2 bg-slate-100 rounded-lg text-sm font-bold" value={editTerm.term} onChange={e => setEditTerm({...editTerm, term: e.target.value})} placeholder="Term" />
                <input className="flex-1 p-2 bg-slate-100 rounded-lg text-sm font-bold" value={editTerm.session} onChange={e => setEditTerm({...editTerm, session: e.target.value})} placeholder="Session" />
                <button onClick={handleSaveTerm} className="bg-indigo-600 px-4 rounded-lg text-white font-bold text-sm">Save</button>
              </div>
              <button onClick={() => setShowModal(true)} className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${termState?.isLocked ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {termState?.isLocked ? <><Unlock size={16}/> Unlock Term</> : <><Lock size={16}/> Lock Term</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600' },
            { label: 'Staff', value: stats.totalStaff, icon: UserCheck, color: 'text-indigo-600' },
            { label: 'Pending Fees', value: stats.feesOverview.pendingCount, icon: AlertTriangle, color: 'text-amber-600' },
            { label: 'Fees Paid', value: stats.feesOverview.paid, icon: CreditCard, color: 'text-emerald-600' },
            { label: 'Pending Results', value: stats.pendingResults, icon: BookOpen, color: 'text-rose-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm">
              <s.icon className={`${s.color} mb-2`} size={20} />
              <p className="text-[10px] font-black text-slate-400 uppercase">{s.label}</p>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, ID, or class..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none" />
        <div className="mt-4 space-y-2">
          {searchResults.map(s => (
            <button key={s._id} onClick={() => setSelectedStudentId(s._id)} className="w-full p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl flex justify-between items-center text-left">
              <div>
                <p className="font-bold text-slate-700">
                  <HighlightText text={`${s.lastName?.toUpperCase() || 'UNKNOWN'}, ${s.firstName || ''} ${s.middleName || ''}`} query={searchQuery} />
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.class} · ID: {s.admissionNumber}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
            <h3 className="text-lg font-black">{termState?.isLocked ? 'Unlock Term?' : 'Lock Term?'}</h3>
            <p className="text-sm text-slate-500 my-4">This will {termState?.isLocked ? 'allow' : 'restrict'} staff from uploading results.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
              <button onClick={toggleTermLock} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {selectedStudentId && <StudentHistoryConsole studentId={selectedStudentId} adminToken={token!} highlightQuery={searchQuery} />}
    </div>
  );
};
export default Dashboard;