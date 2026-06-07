import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface PopulatedStudent {
  _id?: string;
  firstName?: string;
  surname?: string;
  middleName?: string;
  admissionNumber?: string;
  class?: string;
  [key: string]: any;
}

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
  studentId: PopulatedStudent | string | null;
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

const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
const terms = ['First', 'Second', 'Third'];

const Results = () => {
  const { token } = useAuth();

  const [uiError, setUiError] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);

  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [resultToReject, setResultToReject] = useState<PendingResult | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const [approvingId, setApprovingId] = useState<string | null>(null);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    fetchActiveTerm();
    fetchPendingResults();
  }, []);

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
      setUiError('Failed to fetch pending results from server.');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setApprovingId(id);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Result approved successfully.', 'success');
      fetchPendingResults();
    } catch {
      addToast('Failed to approve result.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const initiateReject = (result: PendingResult) => {
    setResultToReject(result);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmedReject = async () => {
    if (!resultToReject || !rejectionReason.trim()) return;
    try {
      setRejecting(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/${resultToReject._id}/reject`,
        { rejectionReason: rejectionReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Result rejected successfully.', 'success');
      setShowRejectModal(false);
      setResultToReject(null);
      setRejectionReason('');
      fetchPendingResults();
    } catch {
      addToast('Failed to reject result.', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleApproveBulk = async () => {
    if (!selectedClass || !selectedTerm) {
      setUiError('Please specify both Class and Term to execute bulk approval.');
      return;
    }
    const currentSession = activeTerm?.session || '';
    if (!confirm(`Approve all pending results for ${selectedClass} - ${selectedTerm} Term (${currentSession})?`)) return;
    try {
      setUiError(null);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/results/approve-bulk`,
        { class: selectedClass, term: selectedTerm, session: currentSession },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('All filtered results approved successfully.', 'success');
      fetchPendingResults();
    } catch {
      addToast('Bulk approval failed. Please try again.', 'error');
    }
  };

  const filteredPending = pendingResults.filter((r) => {
    if (selectedClass && r.class !== selectedClass) return false;
    if (selectedTerm && r.term !== selectedTerm) return false;
    return true;
  });

  /**
   * Resolves student full name from the populated studentId object.
   * Backend populates: firstName, surname, middleName (see resultController getPendingResults).
   * Format: SURNAME, Firstname [Middlename]
   * Falls back to admissionNumber stored directly on the Result document if populate failed.
   */
  const getStudentFullName = (result: PendingResult): string => {
    const s = result.studentId;

    // studentId came back as an unpopulated ObjectId string — populate failed
    // This happens when the student document was deleted but result still exists
    if (!s || typeof s === 'string') {
      return result.admissionNumber || 'Unknown Student';
    }

    const surname = (s.surname || '').trim();
    const firstName = (s.firstName || '').trim();
    const middleName = (s.middleName || '').trim();

    // Both name parts missing — populate returned an empty/partial object
    if (!surname && !firstName) {
      return result.admissionNumber || 'Unknown Student';
    }

    // Build: SURNAME, Firstname Middlename
    const givenNames = [firstName, middleName].filter(Boolean).join(' ');

    if (surname && givenNames) return `${surname.toUpperCase()}, ${givenNames}`;
    if (surname) return surname.toUpperCase();
    return givenNames;
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-bold animate-in slide-in-from-right-5 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Results Manager</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">
            {activeTerm
              ? `Active Term: ${activeTerm.term} Term · ${activeTerm.session} · ${activeTerm.isLocked ? '🔒 Locked' : '🔓 Open'}`
              : 'No active term initialized'}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {uiError && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
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

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-primary" />
        <h2 className="font-black text-gray-800 text-sm uppercase tracking-wider">Pending Approval</h2>
        {pendingResults.length > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {pendingResults.length}
          </span>
        )}
      </div>

      {/* Filters + Bulk Approve */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-end mb-5">
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

      {/* Pending Results List */}
      {loadingPending ? (
        <div className="text-center py-12 text-gray-400 font-semibold text-sm">Loading pending results...</div>
      ) : filteredPending.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
          <CheckCircle size={44} className="text-green-500/80 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-sm">All Records Checked</p>
          <p className="text-xs text-gray-400 mt-0.5">No pending results awaiting approval right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPending.map((result) => (
            <div key={result._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md/5 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Student Name</p>
                  <h3 className="font-black text-gray-900 text-base leading-tight">
                    {getStudentFullName(result)}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
                    <span className="text-xs text-gray-400 font-bold">{result.term} Term · {result.session}</span>
                  </div>
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
                      disabled={approvingId === result._id}
                      className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg font-bold text-xs hover:bg-green-100/70 transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={13} /> {approvingId === result._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => initiateReject(result)}
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

      {/* REJECT MODAL */}
      {showRejectModal && resultToReject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Reject Result</h3>
              <button
                onClick={() => { setShowRejectModal(false); setResultToReject(null); setRejectionReason(''); }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Student</span>
                  <span className="text-sm font-extrabold text-gray-900">{getStudentFullName(resultToReject)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Admission No.</span>
                    <span className="text-sm font-bold text-gray-700">{resultToReject.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Class</span>
                    <span className="text-sm font-bold text-gray-700">{resultToReject.class}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject</span>
                    <span className="text-sm font-bold text-gray-700">{resultToReject.subject}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Term · Session</span>
                    <span className="text-sm font-bold text-gray-700">{resultToReject.term} · {resultToReject.session}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Scores</span>
                    <span className="text-sm font-bold text-gray-700">CA: {resultToReject.testScore} · Exam: {resultToReject.examScore} · Total: {resultToReject.totalScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Grade</span>
                    <span className="text-sm font-bold text-gray-700">{resultToReject.grade}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  <span className="font-black">Warning:</span> This result will be rejected and the staff member will be notified. Please provide a clear reason below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Incorrect score entered, Calculation error detected, Incomplete assessment records..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 resize-none transition-all"
                />
                {rejectionReason.trim() === '' && (
                  <p className="text-[10px] text-gray-400 font-medium mt-1">A reason is required before rejection can proceed.</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
              <button
                type="button"
                disabled={rejecting}
                onClick={() => { setShowRejectModal(false); setResultToReject(null); setRejectionReason(''); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || rejecting}
                onClick={handleConfirmedReject}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;