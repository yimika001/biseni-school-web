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

  // Active Term States
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const [newTerm, setNewTerm] = useState('First');
  const [newSession, setNewSession] = useState('2025/2026');
  const [settingTerm, setSettingTerm] = useState(false);
  const [termMsg, setTermMsg] = useState('');

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

  // Clear messages when changing tabs
  useEffect(() => {
    setSearchErrorMessage(null);
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
      loadingPending || setLoadingPending(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingResults(response.data.results);
    } catch {
      console.error('Failed to fetch pending results');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleSetActiveTerm = async () => {
    try {
      setSettingTerm(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/active-term`,
        { term: newTerm, session: newSession },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTermMsg(`Active term set to ${newTerm} Term ${newSession} successfully.`);
      fetchActiveTerm();
      setTimeout(() => setTermMsg(''), 4000);
    } catch {
      alert('Failed to set active term.');
    } finally {
      setSettingTerm(false);
    }
  };

  const handleToggleLock = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/active-term/lock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchActiveTerm();
    } catch {
      alert('Failed to toggle lock.');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingResults();
    } catch {
      alert('Failed to approve result.');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/${id}/reject`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingResults();
    } catch {
      alert('Failed to reject result.');
    }
  };

  const handleApproveBulk = async () => {
    if (!selectedClass || !selectedTerm) {
      alert('Please select a class and term to approve bulk results.');
      return;
    }
    if (!confirm(`Approve all pending results for ${selectedClass} - ${selectedTerm} term?`)) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/approve-bulk`,
        { class: selectedClass, term: selectedTerm, session: activeTerm?.session },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingResults();
      alert('All results approved successfully.');
    } catch {
      alert('Failed to approve results.');
    }
  };

  const handleStudentSearch = async () => {
    if (!historySearch.trim()) return;
    try {
      setSearchingStudents(true);
      setSearchErrorMessage(null); 
      setSelectedStudent(null);
      setSearchResults([]);
      
      // Cache buster appended to avoid 304 Not Modified browser issues
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
      
      // Determine array structure from response
      let matchedStudents: any[] = [];
      if (response.data && Array.isArray(response.data.students)) {
        matchedStudents = response.data.students;
      } else if (Array.isArray(response.data)) {
        matchedStudents = response.data;
      }

      // Check if the array came back empty (e.g. searching "john")
      if (matchedStudents.length === 0) {
        setSearchResults([]);
        setSearchErrorMessage(`The name "${historySearch}" is not registered in the database.`);
      } else {
        setSearchResults(matchedStudents);
      }
    } catch (error: any) {
      console.error("Search Error:", error);
      setSearchResults([]);
      setSearchErrorMessage(`The name "${historySearch}" is not registered in the database.`);
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
      alert('Failed to fetch student history.');
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
    <div className="p-4 md:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase">Results Manager</h1>
        <p className="text-gray-500 text-xs md:text-sm">
          {activeTerm
            ? `Active Term: ${activeTerm.term} Term · ${activeTerm.session} · ${activeTerm.isLocked ? '🔒 Locked' : '🔓 Open'}`
            : 'No active term set'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'pending' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          <Clock size={14} />
          Pending Approval
          {pendingResults.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
              {pendingResults.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('term')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'term' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          <Settings size={14} /> Term Settings
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          <History size={14} /> Student History
        </button>
      </div>

      {/* PENDING APPROVAL TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Filter Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="p-2 bg-gray-50 border rounded-lg font-bold text-xs outline-none"
              >
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Filter Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="p-2 bg-gray-50 border rounded-lg font-bold text-xs outline-none"
              >
                <option value="">All Terms</option>
                {terms.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button
              onClick={handleApproveBulk}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition-all"
            >
              <CheckCircle size={16} /> Approve Filtered
            </button>
          </div>

          {loadingPending ? (
            <div className="text-center py-12 text-gray-400">Loading pending results...</div>
          ) : filteredPending.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <p className="font-bold">No pending results. All caught up!</p>
            </div>
          ) : (
            filteredPending.map((result) => (
              <div key={result._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase">Pending</span>
                      <span className="text-xs text-gray-400 font-bold">{result.term} Term · {result.session}</span>
                    </div>
                    <h3 className="font-black text-gray-900">
                      {result.studentId?.firstName} {result.studentId?.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold">
                      {result.admissionNumber} · Class {result.class} · {result.subject}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded by: {result.uploadedBy?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">C.A</p>
                      <p className="font-black text-gray-900">{result.testScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Exam</p>
                      <p className="font-black text-gray-900">{result.examScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                      <p className="font-black text-primary text-xl">{result.totalScore}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Grade</p>
                      <p className="font-black text-gray-900">{result.grade}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(result._id)}
                        className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg font-bold text-xs hover:bg-green-100 transition-all"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(result._id)}
                        className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg font-bold text-xs hover:bg-red-100 transition-all"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TERM SETTINGS TAB */}
      {activeTab === 'term' && (
        <div className="max-w-lg space-y-6">
          {activeTerm && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-4">Current Active Term</h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-2xl font-black text-primary">{activeTerm.term} Term</p>
                  <p className="text-gray-500 font-bold">{activeTerm.session}</p>
                  <p className={`text-xs font-black mt-1 ${activeTerm.isLocked ? 'text-red-500' : 'text-green-500'}`}>
                    {activeTerm.isLocked ? '🔒 Upload Locked — Staff cannot upload results' : '🔓 Upload Open — Staff can upload results'}
                  </p>
                </div>
                <button
                  onClick={handleToggleLock}
                  className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                    activeTerm.isLocked
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {activeTerm.isLocked ? '🔓 Unlock Upload' : '🔒 Lock Upload'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-4">Set New Active Term</h3>
            {termMsg && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-green-700 font-bold text-sm">{termMsg}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Term</label>
                <select
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary font-bold"
                >
                  {terms.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Session</label>
                <input
                  type="text"
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary font-bold"
                  placeholder="e.g. 2025/2026"
                />
              </div>
              <button
                onClick={handleSetActiveTerm}
                disabled={settingTerm}
                className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {settingTerm ? 'Setting...' : 'Set Active Term'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            {/* UPDATED TITLE IN HISTORY SECTION */}
            <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-4">
              Lifespan Result Ledger Lookup
            </h3>
            
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStudentSearch()}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700"
                  placeholder="Search by student name or admission number..."
                />
              </div>
              <button
                onClick={handleStudentSearch}
                disabled={searchingStudents}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary-dark transition-all"
              >
                {searchingStudents ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* ERROR ALERT DISPLAY */}
            {searchErrorMessage && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-red-800 uppercase tracking-wider">Search Status</p>
                    <p className="text-xs text-red-700 font-bold mt-0.5">{searchErrorMessage}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSearchErrorMessage(null)} 
                  className="p-1 hover:bg-red-100 text-red-500 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {searchResults.length > 0 && !selectedStudent && (
              <div className="mt-4 space-y-2">
                {searchResults.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => handleViewHistory(s)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary border border-transparent transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-sm">
                        {s.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-400">{s.admissionNumber} · Class {s.class}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary">View Ledger History →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                    {selectedStudent.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-xs text-gray-500">{selectedStudent.admissionNumber} · Class {selectedStudent.class} · {selectedStudent.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedStudent(null); setSearchResults([]); setHistorySearch(''); setSearchErrorMessage(null); }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  &larr; Back to Lookup
                </button>
              </div>

              {loadingHistory ? (
                <div className="text-center py-12 text-gray-400">Loading history...</div>
              ) : Object.keys(studentHistory).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No approved results found in ledger for this student.</p>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {Object.entries(studentHistory).map(([session, termData]) => (
                    <div key={session}>
                      <h4 className="font-black text-gray-700 uppercase text-xs tracking-widest mb-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full">{session}</span>
                      </h4>
                      {Object.entries(termData).map(([term, results]) => (
                        <div key={term} className="mb-6">
                          <p className="font-black text-gray-600 text-sm uppercase mb-3">{term} Term</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border border-gray-100 rounded-xl overflow-hidden">
                              <thead className="bg-gray-50">
                                <tr className="text-[10px] font-bold text-gray-400 uppercase">
                                  <th className="px-4 py-3">Subject</th>
                                  <th className="px-4 py-3 text-center">C.A</th>
                                  <th className="px-4 py-3 text-center">Exam</th>
                                  <th className="px-4 py-3 text-center">Total</th>
                                  <th className="px-4 py-3 text-center">Grade</th>
                                  <th className="px-4 py-3 text-center">Remark</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {results.map((r: any) => (
                                  <tr key={r._id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-bold text-gray-700 text-sm">{r.subject}</td>
                                    <td className="px-4 py-3 text-center text-sm">{r.testScore}</td>
                                    <td className="px-4 py-3 text-center text-sm">{r.examScore}</td>
                                    <td className="px-4 py-3 text-center font-black text-primary">{r.totalScore}</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-black text-xs">{r.grade}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs text-gray-500 font-bold">{r.remark}</td>
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