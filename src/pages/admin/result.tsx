import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Settings, History, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface PendingResult {
  _id: string;
  admissionNumber: string;
  subject: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
  term: string;
  session: string;
  class: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  studentId: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class: string;
  };
  uploadedBy: {
    name: string;
    email: string;
  };
}

interface ActiveTerm {
  term: 'First' | 'Second' | 'Third';
  session: string;
  isLocked: boolean;
}

interface StudentSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  department: string;
}

interface GroupedResults {
  [session: string]: {
    [term: string]: any[];
  };
}

const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
const terms = ['First', 'Second', 'Third'];

const Results = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'term' | 'history'>('pending');

  // Operational Messaging States
  const [uiError, setUiError] = useState<string | null>(null);
  const [termMsg, setTermMsg] = useState('');

  // Active Term States
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const [newTerm, setNewTerm] = useState('First');
  const [newSession, setNewSession] = useState('2025/2026');
  const [settingTerm, setSettingTerm] = useState(false);

  // Pending Results States
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Student History States
  const [historySearch, setHistorySearch] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [studentHistory, setStudentHistory] = useState<GroupedResults>({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchingStudents, setSearchingStudents] = useState(false);
  
  // State to hold the "Not Registered" message
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveTerm();
    fetchPendingResults();
  }, []);

  // Clear transient layout states when changing view context
  useEffect(() => {
    setSearchErrorMessage(null);
    setUiError(null);
  }, [activeTab]);

  const fetchActiveTerm = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/active-term`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveTerm(response.data.activeTerm);
    } catch {
      setActiveTerm(null);
    }
  };

  const fetchPendingResults = async () => {
    try {
      setLoadingPending(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingResults(response.data.results);
    } catch {
      setUiError('Failed to fetch pending results ledger metrics from server.');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleSetActiveTerm = async () => {
    try {
      setSettingTerm(true);
      setUiError(null);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/active-term`,
        { term: newTerm, session: newSession },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTermMsg(`Active term set to ${newTerm} Term ${newSession} successfully.`);
      fetchActiveTerm();
      setTimeout(() => setTermMsg(''), 4000);
    } catch {
      setUiError('Failed to sync and update active school session metrics.');
    } finally {
      setSettingTerm(false);
    }
  };

  const handleToggleLock = async () => {
    try {
      setUiError(null);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/active-term/lock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchActiveTerm();
    } catch {
      setUiError('Failed to toggle results submission system lock.');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setUiError(null);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingResults();
    } catch {
      setUiError('Failed to process individual result approval criteria.');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason?.trim()) return;
    try {
      setUiError(null);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/${id}/reject`,
        { rejectionReason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingResults();
    } catch {
      setUiError('Failed to push rejection transaction criteria to backend database.');
    }
  };

  const handleApproveBulk = async () => {
    if (!selectedClass || !selectedTerm) {
      setUiError('Please specify target Class and Academic Term fields to execute bulk operations.');
      return;
    }
    const currentSession = activeTerm?.session || newSession;
    if (!confirm(`Approve all pending results for ${selectedClass} - ${selectedTerm} term (${currentSession})?`)) return;
    
    try {
      setUiError(null);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/approve-bulk`,
        { class: selectedClass, term: selectedTerm, session: currentSession },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingResults();
      setTermMsg('All targeted ledger criteria updated successfully.');
      setTimeout(() => setTermMsg(''), 4000);
    } catch {
      setUiError('Bulk system approval transactional routine failed.');
    }
  };

  const handleStudentSearch = async () => {
    if (!historySearch.trim()) return;
    try {
      setSearchingStudents(true);
      setSearchErrorMessage(null); 
      setSelectedStudent(null);
      setSearchResults([]);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/students`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          params: { 
            search: historySearch.trim(),
            _t: Date.now() 
          },
        }
      );
      
      let matchedStudents: any[] = [];
      if (response.data && Array.isArray(response.data.students)) {
        matchedStudents = response.data.students;
      } else if (Array.isArray(response.data)) {
        matchedStudents = response.data;
      }

      if (matchedStudents.length === 0) {
        setSearchResults([]);
        setSearchErrorMessage(`The name or entry token "${historySearch}" is not registered in the database.`);
      } else {
        setSearchResults(matchedStudents);
      }
    } catch (error: any) {
      setSearchResults([]);
      setSearchErrorMessage(`The search parameters matching "${historySearch}" returned zero registration instances.`);
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleViewHistory = async (student: StudentSearchResult) => {
    try {
      setSelectedStudent(student);
      setLoadingHistory(true);
      setSearchErrorMessage(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/student/${student._id}/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentHistory(response.data.grouped);
    } catch {
      setUiError('Failed to fetch selected individual lifespan result historical records.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPending = pendingResults.filter((r) => {
    if (selectedClass && r.class !== selectedClass) return false;
    if (selectedTerm && r.term !== selectedTerm) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Results Manager</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">
            {activeTerm
              ? `Active Term: ${activeTerm.term} Term · ${activeTerm.session} · ${activeTerm.isLocked ? '🔒 Locked' : '🔓 Open'}`
              : 'No active terminal framework initialized'}
          </p>
        </div>
      </div>

      {/* Persistent Application Context Notification Blocks */}
      {uiError && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">System Exception</p>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">{uiError}</p>
            </div>
          </div>
          <button onClick={() => setUiError(null)} className="p-1 hover:bg-amber-100 text-amber-500 rounded-lg transition-all">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex gap-2 mb-6 flex-wrap border-b border-gray-100 pb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'pending' ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock size={14} />
          Pending Approval
          {pendingResults.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {pendingResults.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('term')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'term' ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings size={14} /> Term Settings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <History size={14} /> Student History
        </button>
      </div>

      {/* PENDING APPROVAL TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Filter Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-xs outline-none focus:border-primary transition-all"
              >
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Filter Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-xs outline-none focus:border-primary transition-all"
              >
                <option value="">All Terms</option>
                {terms.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button
              onClick={handleApproveBulk}
              disabled={!selectedClass || !selectedTerm}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} /> Approve Filtered Group
            </button>
          </div>

          {loadingPending ? (
            <div className="text-center py-12 text-gray-400 font-semibold text-sm">Loading targeted pending data indexes...</div>
          ) : filteredPending.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
              <CheckCircle size={44} className="text-green-500/80 mx-auto mb-3" />
              <p className="font-bold text-gray-800 text-sm">All Records Checked</p>
              <p className="text-xs text-gray-400 mt-0.5">No compilation entities await modification criteria right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPending.map((result) => (
                <div key={result._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md/5 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
                        <span className="text-xs text-gray-400 font-bold">{result.term} Term · {result.session}</span>
                      </div>
                      <h3 className="font-black text-gray-900 text-base">
                        {result.studentId?.firstName} {result.studentId?.lastName}
                      </h3>
                      <p className="text-xs text-gray-600 font-semibold">
                        {result.admissionNumber} · Class {result.class} · <span className="text-primary font-bold">{result.subject}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Uploaded by: {result.uploadedBy?.name || 'Academic Facilitator'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 bg-gray-50/60 p-3 rounded-xl border border-gray-100/50 justify-between lg:justify-end">
                      <div className="flex gap-4 md:gap-6 px-2">
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">C.A</p>
                          <p className="font-black text-gray-900 text-sm mt-0.5">{result.testScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Exam</p>
                          <p className="font-black text-gray-900 text-sm mt-0.5">{result.examScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="font-black text-primary text-base mt-0.5">{result.totalScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Grade</p>
                          <p className="font-black text-gray-900 text-sm mt-0.5">{result.grade}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 border-l border-gray-200 pl-4">
                        <button
                          onClick={() => handleApprove(result._id)}
                          className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg font-bold text-xs hover:bg-green-100/70 transition-all"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(result._id)}
                          className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-100/70 transition-all"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TERM SETTINGS TAB */}
      {activeTab === 'term' && (
        <div className="max-w-xl space-y-6">
          {activeTerm && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-4">Current Active Administration Node</h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-2xl font-black text-primary tracking-tight">{activeTerm.term} Term</p>
                  <p className="text-gray-600 font-bold text-sm mt-0.5">{activeTerm.session} Session</p>
                  <p className={`text-xs font-black mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${activeTerm.isLocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {activeTerm.isLocked ? '🔒 Upload Interface Locked' : '🔓 Input Operations Allowed'}
                  </p>
                </div>
                <button
                  onClick={handleToggleLock}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                    activeTerm.isLocked
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {activeTerm.isLocked ? 'Unlock Portal' : 'Lock Portal Channels'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-4">Transition Active Academic Period</h3>
            {termMsg && (
              <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-green-800 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle size={14} /> {termMsg}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Target Term</label>
                <select
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary font-bold text-sm"
                >
                  {terms.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Session Target Token</label>
                <input
                  type="text"
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary font-bold text-sm"
                  placeholder="e.g. 2025/2026"
                />
              </div>
              <button
                onClick={handleSetActiveTerm}
                disabled={settingTerm}
                className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {settingTerm ? 'Updating Core Context...' : 'Commit Operational Transition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-4">
              Lifespan Result Ledger Lookup
            </h3>
            
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStudentSearch()}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700 placeholder-gray-400"
                  placeholder="Query index by name identifier or registration sequence..."
                />
              </div>
              <button
                onClick={handleStudentSearch}
                disabled={searchingStudents || !historySearch.trim()}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all shadow-sm"
              >
                {searchingStudents ? 'Indexing...' : 'Search'}
              </button>
            </div>

            {/* ERROR ALERT DISPLAY */}
            {searchErrorMessage && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-red-900 uppercase tracking-wider">Registry Sync Notification</p>
                    <p className="text-xs text-red-700 font-semibold mt-0.5">{searchErrorMessage}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSearchErrorMessage(null)} 
                  className="p-1 hover:bg-red-100 text-red-500 rounded-lg transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {searchResults.length > 0 && !selectedStudent && (
              <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-white">
                {searchResults.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleViewHistory(s)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                        {s.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-400 font-medium">{s.admissionNumber} · Class {s.class}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">Extract History →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-sm">
                    {selectedStudent.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm md:text-base">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-xs text-gray-500 font-medium">{selectedStudent.admissionNumber} · Class {selectedStudent.class} {selectedStudent.department ? `· ${selectedStudent.department}` : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedStudent(null); setSearchResults([]); setHistorySearch(''); setSearchErrorMessage(null); }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 transition-all shadow-sm"
                >
                  &larr; Flush Index Search
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-12 text-gray-400 font-medium text-sm">Parsing structural historical matrix...</div>
              ) : Object.keys(studentHistory).length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <History size={36} className="mx-auto mb-2 opacity-25" />
                  <p className="font-bold text-gray-800 text-sm">Zero Valid Records</p>
                  <p className="text-xs text-gray-400 mt-0.5">No finalized performance structures exist inside the current workspace.</p>
                </div>
              ) : (
                <div className="p-6 space-y-8 bg-white">
                  {Object.entries(studentHistory).map(([session, termData]) => (
                    <div key={session} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                      <div className="mb-4">
                        <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{session} Session</span>
                      </div>
                      
                      {Object.entries(termData).map(([term, results]) => (
                        <div key={term} className="mb-6 last:mb-0">
                          <p className="font-black text-gray-700 text-xs uppercase tracking-wide mb-2.5">{term} Term Summary</p>
                          <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                  <th className="px-4 py-3">Subject Content</th>
                                  <th className="px-3 py-3 text-center">C.A</th>
                                  <th className="px-3 py-3 text-center">Exam</th>
                                  <th className="px-3 py-3 text-center">Total</th>
                                  <th className="px-3 py-3 text-center">Grade</th>
                                  <th className="px-4 py-3 text-center">Remarks</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {results.map((r: any) => (
                                  <tr key={r._id} className="hover:bg-gray-50/40 transition-all">
                                    <td className="px-4 py-3 font-bold text-gray-800 text-xs">{r.subject}</td>
                                    <td className="px-3 py-3 text-center text-xs text-gray-600 font-medium">{r.testScore}</td>
                                    <td className="px-3 py-3 text-center text-xs text-gray-600 font-medium">{r.examScore}</td>
                                    <td className="px-3 py-3 text-center font-black text-primary text-xs">{r.totalScore}</td>
                                    <td className="px-3 py-3 text-center">
                                      <span className="bg-primary/5 text-primary px-2 py-0.5 rounded font-black text-[10px] border border-primary/10">{r.grade}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-[11px] text-gray-500 font-bold tracking-tight">{r.remark || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;