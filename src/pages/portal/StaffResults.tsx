import React, { useState, useEffect } from 'react';
import { Save, Search, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Allocation {
  subjectName: string;
  classLevel: string;
  department: 'General' | 'Science' | 'Art';
}

interface Student {
  _id: string;
  firstName: string;
  surname: string;
  middleName?: string;
  admissionNumber: string;
}

interface ResultEntry {
  studentId: string;
  testScore: number;
  examScore: number;
}

interface MyUpload {
  _id: string;
  admissionNumber: string;
  subject: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  term: string;
  session: string;
  class: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  studentId: {
    firstName: string;
    surname: string;
    admissionNumber: string;
    class: string;
  };
}

interface ActiveTerm {
  term: string;
  session: string;
  isLocked: boolean;
}

const calculateGrade = (total: number) => {
  if (total >= 75) return 'A1';
  if (total >= 70) return 'B2';
  if (total >= 65) return 'B3';
  if (total >= 60) return 'C4';
  if (total >= 55) return 'C5';
  if (total >= 50) return 'C6';
  if (total >= 45) return 'D7';
  if (total >= 40) return 'E8';
  return 'F9';
};

const StaffResults = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'my-uploads'>('upload');

  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const [loadingTerm, setLoadingTerm] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loadingAllocations, setLoadingAllocations] = useState(true);

  // Selection — driven by allocations, not free text
  const [selectedAllocationIdx, setSelectedAllocationIdx] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, ResultEntry>>({});

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [myUploads, setMyUploads] = useState<MyUpload[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  useEffect(() => { fetchActiveTerm(); fetchAllocations(); }, []);
  useEffect(() => { if (activeTab === 'my-uploads') fetchMyUploads(); }, [activeTab]);

  // When selected allocation changes, fetch students for that class
  useEffect(() => {
    const alloc = allocations[selectedAllocationIdx];
    if (alloc) fetchStudents(alloc.classLevel);
  }, [selectedAllocationIdx, allocations]);

  const fetchActiveTerm = async () => {
    try {
      setLoadingTerm(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/active-term`, { headers: { Authorization: `Bearer ${token}` } });
      const d = res.data;
      setActiveTerm(d.activeTerm || (d.term ? { term: d.term, session: d.session, isLocked: d.isLocked } : null));
    } catch { setActiveTerm(null); } finally { setLoadingTerm(false); }
  };

  const fetchAllocations = async () => {
    try {
      setLoadingAllocations(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/staff/my-allocations`, { headers: { Authorization: `Bearer ${token}` } });
      const allocs: Allocation[] = Array.isArray(res.data) ? res.data : [];
      setAllocations(allocs);
      setSelectedAllocationIdx(0);
    } catch { console.error('Failed to fetch allocations'); } finally { setLoadingAllocations(false); }
  };

  const fetchStudents = async (classLevel: string) => {
    try {
      setLoadingStudents(true);
      setErrorMsg('');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/students/${encodeURIComponent(classLevel)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const incoming: Student[] = res.data.students || [];
      setStudents(incoming);
      setScores(prev => {
        const next: Record<string, ResultEntry> = {};
        incoming.forEach(s => {
          next[s._id] = prev[s._id] || { studentId: s._id, testScore: 0, examScore: 0 };
        });
        return next;
      });
    } catch {
      setStudents([]);
      setErrorMsg('Failed to fetch students for this class.');
    } finally { setLoadingStudents(false); }
  };

  const fetchMyUploads = async () => {
    try {
      setLoadingUploads(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/results/my-uploads`, { headers: { Authorization: `Bearer ${token}` } });
      setMyUploads(res.data.results || []);
    } catch { console.error('Failed to fetch uploads'); } finally { setLoadingUploads(false); }
  };

  const handleScoreChange = (studentId: string, field: 'testScore' | 'examScore', value: string) => {
    const num = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    const cap = field === 'testScore' ? 40 : 60;
    if (num > cap) return;
    setScores(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: num } }));
  };

  const handleUpload = async () => {
    if (!activeTerm || activeTerm.isLocked) { setErrorMsg('Upload session is locked.'); return; }
    const alloc = allocations[selectedAllocationIdx];
    if (!alloc) { setErrorMsg('No allocation selected.'); return; }

    const results = Object.values(scores).filter(s => s.testScore > 0 || s.examScore > 0);
    if (results.length === 0) { setErrorMsg('Please enter at least one score before submitting.'); return; }

    try {
      setSubmitting(true); setErrorMsg(''); setSuccessMsg('');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/results/upload`,
        { results, subject: alloc.subjectName, class: alloc.classLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(res.data.message || 'Scores submitted successfully.');
      setScores(prev => {
        const cleared: Record<string, ResultEntry> = {};
        Object.keys(prev).forEach(k => { cleared[k] = { studentId: k, testScore: 0, examScore: 0 }; });
        return cleared;
      });
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload results. Please try again.');
    } finally { setSubmitting(false); }
  };

  const currentAlloc = allocations[selectedAllocationIdx];
  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (s: string) => s === 'Approved' ? 'bg-green-100 text-green-700' : s === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
  const getStatusIcon = (s: string) => s === 'Approved' ? <CheckCircle size={12} /> : s === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 w-full max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Results Upload Panel</h1>
        {loadingTerm ? (
          <p className="text-gray-400 text-xs mt-1">Fetching term status...</p>
        ) : activeTerm ? (
          <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${activeTerm.isLocked ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {activeTerm.isLocked ? <XCircle size={14} /> : <CheckCircle size={14} />}
            {activeTerm.term} Term · {activeTerm.session} · {activeTerm.isLocked ? 'Locked' : 'Open'}
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gray-50 text-gray-500 border border-gray-200">
            <AlertCircle size={14} /> No active term. Contact admin.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['upload', 'my-uploads'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {tab === 'my-uploads' && <Clock size={14} />}
            {tab === 'upload' ? 'Upload Scores' : 'My Records'}
          </button>
        ))}
      </div>

      {/* UPLOAD TAB */}
      {activeTab === 'upload' && (
        <>
          {activeTerm?.isLocked && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-black text-sm uppercase">Upload Locked</p>
                <p className="text-red-500 text-xs font-medium mt-1">The administration has locked score submissions for this term.</p>
              </div>
            </div>
          )}

          {successMsg && <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"><CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" /><p className="text-green-700 font-bold text-sm">{successMsg}</p></div>}
          {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" /><p className="text-red-700 font-bold text-sm">{errorMsg}</p></div>}

          {/* Allocation selector */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-4">
            {loadingAllocations ? (
              <p className="text-xs text-gray-400 font-medium">Loading your allocations...</p>
            ) : allocations.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-bold">
                No subject allocations found. Contact your administrator.
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Subject & Class</label>
                <div className="flex flex-wrap gap-2">
                  {allocations.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAllocationIdx(i)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedAllocationIdx === i
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {a.subjectName} · {a.classLevel}
                    </button>
                  ))}
                </div>
                {currentAlloc && (
                  <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Scope</p>
                      <p className="text-xs font-black text-gray-700">{currentAlloc.subjectName} · {currentAlloc.classLevel} · {currentAlloc.department} Dept · {activeTerm?.term} Term {activeTerm?.session}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search students by name or admission number..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-primary transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  {['Student', 'Admission No.', 'C.A (40)', 'Exam (60)', 'Total', 'Grade'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingStudents ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-xs font-bold text-gray-400">Loading class roster...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-xs font-bold text-gray-400">{allocations.length === 0 ? 'No allocations assigned.' : 'No students found for this class.'}</td></tr>
                ) : (
                  filteredStudents.map(s => {
                    const score = scores[s._id] || { studentId: s._id, testScore: 0, examScore: 0 };
                    const total = score.testScore + score.examScore;
                    return (
                      <tr key={s._id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-900 text-sm">{s.surname?.toUpperCase()}, {s.firstName} {s.middleName || ''}</td>
                        <td className="px-6 py-4 text-gray-500 font-bold text-xs font-mono text-center">{s.admissionNumber}</td>
                        <td className="px-6 py-4 text-center">
                          <input type="number" min={0} max={40} value={score.testScore === 0 ? '' : score.testScore} placeholder="0"
                            onChange={e => handleScoreChange(s._id, 'testScore', e.target.value)}
                            disabled={activeTerm?.isLocked}
                            className="w-24 mx-auto block p-2.5 border border-gray-200 rounded-xl text-center font-black focus:border-primary outline-none text-xs disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input type="number" min={0} max={60} value={score.examScore === 0 ? '' : score.examScore} placeholder="0"
                            onChange={e => handleScoreChange(s._id, 'examScore', e.target.value)}
                            disabled={activeTerm?.isLocked}
                            className="w-24 mx-auto block p-2.5 border border-gray-200 rounded-xl text-center font-black focus:border-primary outline-none text-xs disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        </td>
                        <td className="px-6 py-4 text-center font-black text-primary text-base">{total}</td>
                        <td className="px-6 py-4 text-center"><span className="font-black bg-gray-100 px-3 py-1.5 rounded-lg text-xs text-gray-700">{calculateGrade(total)}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4 mb-6">
            {loadingStudents ? (
              <div className="text-center py-16 text-xs font-black text-gray-400">Loading...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-xs font-black text-gray-400 bg-white border rounded-2xl">No students found.</div>
            ) : (
              filteredStudents.map(s => {
                const score = scores[s._id] || { studentId: s._id, testScore: 0, examScore: 0 };
                const total = score.testScore + score.examScore;
                return (
                  <div key={s._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500"><User size={18} /></div>
                        <div>
                          <h3 className="font-black text-gray-900 text-xs uppercase">{s.surname}, {s.firstName}</h3>
                          <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5">{s.admissionNumber}</p>
                        </div>
                      </div>
                      <span className={`text-base font-black ${total >= 50 ? 'text-primary' : 'text-red-600'}`}>{calculateGrade(total)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">C.A (40)</label>
                        <input type="number" min={0} max={40} value={score.testScore === 0 ? '' : score.testScore} placeholder="0"
                          onChange={e => handleScoreChange(s._id, 'testScore', e.target.value)}
                          disabled={activeTerm?.isLocked}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-xs outline-none focus:border-primary disabled:bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Exam (60)</label>
                        <input type="number" min={0} max={60} value={score.examScore === 0 ? '' : score.examScore} placeholder="0"
                          onChange={e => handleScoreChange(s._id, 'examScore', e.target.value)}
                          disabled={activeTerm?.isLocked}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-xs outline-none focus:border-primary disabled:bg-gray-100" />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase">Total</span>
                      <span className="font-black text-base text-primary">{total} / 100</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={submitting || activeTerm?.isLocked || !activeTerm || allocations.length === 0 || filteredStudents.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save size={16} />
            {submitting ? 'Submitting...' : 'Submit Scores for Approval'}
          </button>
        </>
      )}

      {/* MY RECORDS TAB */}
      {activeTab === 'my-uploads' && (
        <div className="space-y-4">
          {loadingUploads ? (
            <div className="text-center py-16 text-xs font-black text-gray-400">Loading records...</div>
          ) : myUploads.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl text-gray-400">
              <Clock size={36} className="mx-auto mb-3 opacity-25 text-primary" />
              <p className="font-black text-xs uppercase tracking-widest">No uploads found for this term.</p>
            </div>
          ) : (
            myUploads.map(upload => (
              <div key={upload._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${getStatusStyle(upload.status)}`}>
                        {getStatusIcon(upload.status)} {upload.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{upload.term} Term · {upload.session}</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-sm uppercase">
                      {upload.studentId?.surname ? `${upload.studentId.surname}, ${upload.studentId.firstName}` : upload.studentId?.firstName || 'Unknown'}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      {upload.admissionNumber} · {upload.class} · {upload.subject}
                    </p>
                    {upload.status === 'Rejected' && upload.rejectionReason && (
                      <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-xl mt-3 flex items-start gap-2 max-w-xl">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p><strong>Reason:</strong> {upload.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-5 bg-gray-50/60 border border-gray-100/70 p-3 rounded-xl shrink-0">
                    {[['C.A', upload.testScore], ['Exam', upload.examScore], ['Total', upload.totalScore], ['Grade', upload.grade]].map(([label, val]) => (
                      <div key={label} className={`text-center min-w-[36px] ${label === 'Total' ? 'border-l border-gray-200/60 pl-4' : ''}`}>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
                        <p className={`font-black text-sm mt-0.5 ${label === 'Total' ? 'text-primary text-base' : 'text-gray-900'}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StaffResults;