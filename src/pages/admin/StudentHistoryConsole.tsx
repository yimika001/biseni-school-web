import { useEffect, useState } from 'react';
import { Settings, Lock, Unlock, Loader2, Search, Check, FileText } from 'lucide-react';
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

  useEffect(() => { if (token) fetchData(); }, [token, user?.role]);

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
      triggerSuccess(`System has been ${response.data.activeTerm?.isLocked ? 'locked' : 'unlocked'} successfully.`);
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
      triggerSuccess("Academic session context updated successfully!");
    } catch (error) {
      alert("Failed to update term/session.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={36} /></div>;

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-8">
      {/* Success Notification */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Check size={20} /> <p className="font-bold text-sm">{successMsg}</p>
        </div>
      )}

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
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Session</label><input type="text" value={newSession} onChange={(e) => setNewSession(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold" /></div>
            </div>
            <div className="flex gap-3"><button onClick={() => setShowConfigModal(false)} className="flex-1 py-2.5 bg-gray-100 font-bold text-gray-700 rounded-xl">Cancel</button><button onClick={handleUpdateTerm} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl">{isUpdating ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Save Changes"}</button></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Administrative Overview</h1><p className="text-gray-500 text-sm mt-1">Manage portal activities and search student records.</p></div>
        {termState && (
          <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 shadow-sm p-4 rounded-xl min-w-[320px]">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Current Session Context</span>
              <div className="flex items-center gap-2 mt-0.5"><h4 className="text-xs font-bold text-gray-900 uppercase">{termState.term} Term · {termState.session}</h4><button onClick={() => { setNewTerm(termState.term); setNewSession(termState.session); setShowConfigModal(true); }} className="text-indigo-600"><Settings size={14} /></button></div>
            </div>
            <button onClick={() => setShowLockModal(true)} className={`flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-lg ${termState.isLocked ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>{lockToggleLoading ? <Loader2 size={14} className="animate-spin" /> : termState.isLocked ? <Unlock size={14} /> : <Lock size={14} />}</button>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Search size={18} /> Student Record Search</h3>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or admission number..." className="w-full p-3 border border-gray-200 rounded-lg text-sm" />
        {isSearching ? <p className="mt-4 text-xs text-gray-400">Searching...</p> : (
          <div className="mt-4 space-y-2">
            {searchResults.map(student => (
              <button key={student._id} onClick={() => setSelectedStudentId(student._id)} className="w-full p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-indigo-50 border border-gray-100 transition-all">
                <span className="font-bold text-sm text-gray-800">{student.lastName}, {student.firstName}</span>
                <span className="text-[10px] font-mono bg-white px-2 py-1 rounded border">{student.admissionNumber}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student History Console */}
      {selectedStudentId && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <StudentHistoryConsole studentId={selectedStudentId} adminToken={token!} />
          <div className="p-4 border-t text-center">
            <button onClick={() => setSelectedStudentId(null)} className="text-xs font-black text-gray-400 underline hover:text-gray-600">Close History Viewer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;