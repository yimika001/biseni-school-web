import { useEffect, useState } from 'react';
import { Loader2, Check, Users, UserCheck, AlertTriangle, BookOpen, Lock, Unlock, X, TrendingUp, CreditCard, Clock } from 'lucide-react';
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
  const [showStudentModal, setShowStudentModal] = useState(false);

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

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setShowStudentModal(true);
  };

  const handleCloseStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudentId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  const statCards = stats ? [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
      iconBg: 'bg-blue-500/30',
      accent: 'text-blue-100',
    },
    {
      label: 'Total Staff',
      value: stats.totalStaff,
      icon: UserCheck,
      bg: 'bg-gradient-to-br from-violet-600 to-violet-700',
      iconBg: 'bg-violet-500/30',
      accent: 'text-violet-100',
    },
    {
      label: 'Fees Paid',
      value: stats.feesOverview.paidCount,
      icon: CreditCard,
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-400/30',
      accent: 'text-emerald-100',
    },
    {
      label: 'Part Payment',
      value: stats.feesOverview.partPaidCount,
      icon: TrendingUp,
      bg: 'bg-gradient-to-br from-sky-500 to-sky-600',
      iconBg: 'bg-sky-400/30',
      accent: 'text-sky-100',
    },
    {
      label: 'Pending Fees',
      value: stats.feesOverview.pendingCount,
      icon: AlertTriangle,
      bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconBg: 'bg-amber-400/30',
      accent: 'text-amber-100',
    },
    {
      label: 'Pending Results',
      value: stats.pendingResults,
      icon: Clock,
      bg: 'bg-gradient-to-br from-rose-500 to-rose-600',
      iconBg: 'bg-rose-400/30',
      accent: 'text-rose-100',
    },
  ] : [];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
          <Check size={20} />
          <p className="font-bold text-sm">{successMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Biseni Secondary School — Admin Panel</p>
        </div>
        <button
          onClick={() => setShowSessionModal(true)}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-left min-w-[220px]"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
          <p className="text-sm font-black text-slate-800 mt-0.5">{termState?.term} Term · {termState?.session}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
            {termState?.isLocked
              ? <><Lock size={11} className="text-red-500" /><span className="text-red-500">Term Locked</span></>
              : <><Unlock size={11} className="text-emerald-500" /><span className="text-emerald-500">Term Unlocked</span></>}
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className={`${s.bg} p-5 rounded-2xl shadow-md relative overflow-hidden`}>
              {/* Background icon watermark */}
              <div className="absolute -bottom-3 -right-3 opacity-10">
                <s.icon size={64} className="text-white" />
              </div>
              <div className={`${s.iconBg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={18} className="text-white" />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-wider leading-tight ${s.accent}`}>{s.label}</p>
              <p className="text-3xl font-black text-white mt-1 leading-none">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Student Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Student Search</p>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or admission number..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-300 transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
        />
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {searchResults.map(s => {
              const fullName = `${s.surname || ''} ${s.firstName || ''} ${s.middleName || ''}`.trim();
              return (
                <button
                  key={s._id}
                  onClick={() => handleSelectStudent(s._id)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent rounded-2xl flex justify-between items-center text-left transition-all group"
                >
                  <div>
                    <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors">
                      <HighlightText text={fullName} query={searchQuery} />
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.admissionNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg">{s.class}</span>
                    <span className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-4 relative shadow-2xl">
            <button onClick={() => setShowSessionModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} />
            </button>
            <h3 className="font-black text-lg text-slate-900">Manage Session</h3>
            <select className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700 outline-none" value={editTerm.term} onChange={e => setEditTerm({ ...editTerm, term: e.target.value })}>
              <option value="First">First Term</option>
              <option value="Second">Second Term</option>
              <option value="Third">Third Term</option>
            </select>
            <input className="w-full p-3 bg-slate-100 rounded-xl font-bold text-slate-700 outline-none" value={editTerm.session} onChange={e => setEditTerm({ ...editTerm, session: e.target.value })} placeholder="e.g. 2025/2026" />
            <button onClick={handleSaveTerm} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Save Changes</button>
            <button onClick={() => { setShowSessionModal(false); setShowLockModal(true); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
              {termState?.isLocked ? 'Unlock Term' : 'Lock Term'}
            </button>
          </div>
        </div>
      )}

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-black text-lg text-slate-900">Confirm Action</h3>
            <p className="text-sm my-4 text-slate-600">{termState?.isLocked ? 'Unlock this term to allow result uploads?' : 'Lock this term to restrict all result uploads?'}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLockModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={toggleTermLock} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showStudentModal && selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="font-black text-slate-900 text-lg uppercase tracking-tight">Student Profile</h2>
              <button
                onClick={handleCloseStudentModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1">
              <StudentHistoryConsole
                studentId={selectedStudentId}
                adminToken={token!}
                highlightQuery={searchQuery}
                onClose={handleCloseStudentModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;