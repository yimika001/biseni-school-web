import React, { useState, useEffect } from 'react';
import { Save, Search, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
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
    lastName: string;
    admissionNumber: string;
    class: string;
  };
}

interface ActiveTerm {
  term: string;
  session: string;
  isLocked: boolean;
}

interface StaffProfile {
  subjects: string[];
  department: string;
}

const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

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

  // Core Synchronization States
  const [activeTerm, setActiveTerm] = useState<ActiveTerm | null>(null);
  const [loadingTerm, setLoadingTerm] = useState(true);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);

  // Score Workboard Management States
  const [selectedClass, setSelectedClass] = useState('SS1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, ResultEntry>>({});
  
  // Interface System States
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // History Log States
  const [myUploads, setMyUploads] = useState<MyUpload[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  // Base Context Initialization
  useEffect(() => {
    fetchActiveTerm();
    fetchStaffProfile();
  }, []);

  // History Tab Trigger Hook
  useEffect(() => {
    if (activeTab === 'my-uploads') {
      fetchMyUploads();
    }
  }, [activeTab]);

  // Class Roster Pull Effect Hook
  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchActiveTerm = async () => {
    try {
      setLoadingTerm(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/active-term`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveTerm(response.data.activeTerm);
    } catch {
      setActiveTerm(null);
    } finally {
      setLoadingTerm(false);
    }
  };

  const fetchStaffProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStaffProfile(response.data.profile);
      if (response.data.profile?.subjects?.length > 0) {
        setSelectedSubject(response.data.profile.subjects[0]);
      }
    } catch {
      console.error('Failed to fetch staff profile');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setErrorMsg('');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/students/${selectedClass}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const incomingStudents = response.data.students || [];
      setStudents(incomingStudents);
      
      // Smart State Reducer: Preserves existing values instead of blindly resetting to 0
      setScores((prevScores) => {
        const structuralState: Record<string, ResultEntry> = {};
        incomingStudents.forEach((s: Student) => {
          structuralState[s._id] = prevScores[s._id] || {
            studentId: s._id,
            testScore: 0,
            examScore: 0,
          };
        });
        return structuralState;
      });
    } catch (err) {
      setStudents([]);
      setErrorMsg('Failed to sync student database tables.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchMyUploads = async () => {
    try {
      setLoadingUploads(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/my-uploads`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyUploads(response.data.results || []);
    } catch {
      console.error('Failed to fetch uploads');
    } finally {
      setLoadingUploads(false);
    }
  };

  const handleScoreChange = (
    studentId: string,
    field: 'testScore' | 'examScore',
    value: string
  ) => {
    // Sanitizes input value to fall back cleanly to 0 if an invalid character/empty field occurs
    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    const maximumCap = field === 'testScore' ? 40 : 60;

    if (numericValue > maximumCap) return; // Silent rejection of out-of-bounds metrics

    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numericValue,
      },
    }));
  };

  const handleUpload = async () => {
    // Guard Clause checks
    if (!activeTerm || activeTerm.isLocked) {
      setErrorMsg('Submission denied. The term upload session is locked.');
      return;
    }

    if (!selectedSubject) {
      setErrorMsg('Please select a subject target.');
      return;
    }

    // Filters down to only modified entries where work has explicitly been documented
    const results = Object.values(scores).filter(
      (s) => s.testScore > 0 || s.examScore > 0
    );

    if (results.length === 0) {
      setErrorMsg('Please enter at least one score value greater than zero before saving.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/results/upload`,
        {
          results,
          subject: selectedSubject,
          class: selectedClass,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMsg(response.data.message || 'Academic scores compiled and saved successfully.');
      
      // Soft reset score entries back down to 0 safely following data sync
      setScores((prev) => {
        const cleaned: Record<string, ResultEntry> = {};
        Object.keys(prev).forEach((key) => {
          cleaned[key] = { studentId: key, testScore: 0, examScore: 0 };
        });
        return cleaned;
      });

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle size={12} />;
      case 'Rejected': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 w-full max-w-7xl mx-auto">

      {/* Header View */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Results Upload Panel</h1>

        {/* Dynamic System Term Conditions */}
        {loadingTerm ? (
          <p className="text-gray-400 text-xs mt-1 font-medium">Fetching sync status...</p>
        ) : activeTerm ? (
          <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
            activeTerm.isLocked
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {activeTerm.isLocked ? <XCircle size={14} /> : <CheckCircle size={14} />}
            {activeTerm.term} Term · {activeTerm.session} ·
            {activeTerm.isLocked ? ' Upload Session Locked' : ' Upload Open'}
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200">
            <AlertCircle size={14} /> System Term Warning: Contact School Administrator.
          </div>
        )}
      </div>

      {/* Primary Workspace Selection Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            activeTab === 'upload' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Upload Scores
        </button>
        <button
          onClick={() => setActiveTab('my-uploads')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === 'my-uploads' ? 'bg-primary text-white shadow-md shadow-primary/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock size={14} /> My Records
        </button>
      </div>

      {/* UPLOAD WORKSPACE TAB */}
      {activeTab === 'upload' && (
        <>
          {activeTerm?.isLocked && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-black text-sm uppercase tracking-tight">Changes Blocked by Board</p>
                <p className="text-red-500 text-xs font-medium mt-1">The administration panel has restricted score logs for this term cycle.</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-green-700 font-bold text-sm">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 font-bold text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Configuration Tooling Layout */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Class Level</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-primary outline-none focus:border-primary transition-all bg-white"
                >
                  {classes.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Assigned Subject Profile {staffProfile?.subjects?.length ? '— Validated' : ''}
                </label>
                {staffProfile?.subjects?.length ? (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-primary outline-none focus:border-primary transition-all bg-white"
                  >
                    {staffProfile.subjects.map((s) => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-bold">
                    No verified subject profile logs found. Contact Admin.
                  </div>
                )}
              </div>
            </div>

            {activeTerm && (
              <div className="bg-gray-50 rounded-xl p-3.5 mb-4 border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Workspace Scope</p>
                <p className="text-xs font-black text-gray-700 mt-0.5">{activeTerm.term} Term Cycle · Academic Session {activeTerm.session}</p>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Query student records by name or legal registration id..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Matrix Render View */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admission Code</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-36">C.A Score Max(40)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-36">Exam Score Max(60)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-28">Aggregate</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-24">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingStudents ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Syncing class records roster...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">No matching active database links found for this target class level.</td></tr>
                ) : (
                  filteredStudents.map((s) => {
                    const score = scores[s._id] || { studentId: s._id, testScore: 0, examScore: 0 };
                    const total = (score.testScore || 0) + (score.examScore || 0);
                    return (
                      <tr key={s._id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-900 text-sm">{s.firstName} {s.lastName}</td>
                        <td className="px-6 py-4 text-gray-500 font-bold text-xs font-mono">{s.admissionNumber}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number" min={0} max={40}
                            value={score.testScore === 0 ? '' : score.testScore}
                            placeholder="0"
                            onChange={(e) => handleScoreChange(s._id, 'testScore', e.target.value)}
                            disabled={activeTerm?.isLocked}
                            className="w-24 mx-auto block p-2.5 border border-gray-200 rounded-xl text-center font-black focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number" min={0} max={60}
                            value={score.examScore === 0 ? '' : score.examScore}
                            placeholder="0"
                            onChange={(e) => handleScoreChange(s._id, 'examScore', e.target.value)}
                            disabled={activeTerm?.isLocked}
                            className="w-24 mx-auto block p-2.5 border border-gray-200 rounded-xl text-center font-black focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-6 py-4 text-center font-black text-primary text-base">{total}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black bg-gray-100 px-3 py-1.5 rounded-lg text-xs min-w-[40px] inline-block text-gray-700">{calculateGrade(total)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Adaptive Mobile Display Viewports */}
          <div className="md:hidden space-y-4 mb-6">
            {loadingStudents ? (
              <div className="text-center py-16 text-xs font-black text-gray-400 uppercase tracking-widest">Syncing mobile data grids...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-xs font-black text-gray-400 uppercase tracking-widest bg-white border rounded-2xl">No database entries matched query parameters.</div>
            ) : (
              filteredStudents.map((s) => {
                const score = scores[s._id] || { studentId: s._id, testScore: 0, examScore: 0 };
                const total = (score.testScore || 0) + (score.examScore || 0);
                return (
                  <div key={s._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500"><User size={18} /></div>
                        <div>
                          <h3 className="font-black text-gray-900 text-xs uppercase tracking-tight">{s.firstName} {s.lastName}</h3>
                          <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5">{s.admissionNumber}</p>
                        </div>
                      </div>
                      <span className={`text-base font-black ${total >= 50 ? 'text-primary' : 'text-red-600'}`}>
                        {calculateGrade(total)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">C.A Log (40)</label>
                        <input
                          type="number" min={0} max={40}
                          value={score.testScore === 0 ? '' : score.testScore}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(s._id, 'testScore', e.target.value)}
                          disabled={activeTerm?.isLocked}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-xs outline-none focus:border-primary disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Exam Log (60)</label>
                        <input
                          type="number" min={0} max={60}
                          value={score.examScore === 0 ? '' : score.examScore}
                          placeholder="0"
                          onChange={(e) => handleScoreChange(s._id, 'examScore', e.target.value)}
                          disabled={activeTerm?.isLocked}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center font-black text-xs outline-none focus:border-primary disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aggregate Total</span>
                      <span className="font-black text-base text-primary">{total} / 100</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submission Pipeline Control */}
          <button
            onClick={handleUpload}
            disabled={submitting || activeTerm?.isLocked || !activeTerm || filteredStudents.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-primary hover:scale-[1.01] active:scale-[0.99] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all"
          >
            <Save size={16} />
            {submitting ? 'Processing Upload Pipeline...' : 'Submit Academic Scores For Approval'}
          </button>
        </>
      )}

      {/* HISTORICAL RECORDS DISPATCH TAB */}
      {activeTab === 'my-uploads' && (
        <div className="space-y-4">
          {loadingUploads ? (
            <div className="text-center py-16 text-xs font-black text-gray-400 uppercase tracking-widest">Syncing personal upload logs...</div>
          ) : myUploads.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-inner text-gray-400">
              <Clock size={36} className="mx-auto mb-3 opacity-25 text-primary" />
              <p className="font-black text-xs uppercase tracking-widest">No matching history matrix found.</p>
            </div>
          ) : (
            myUploads.map((upload) => (
              <div key={upload._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${getStatusStyle(upload.status)}`}>
                        {getStatusIcon(upload.status)} {upload.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{upload.term} Term · System Cycle {upload.session}</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                      {upload.studentId?.firstName} {upload.studentId?.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      Registration: <span className="font-mono text-gray-700">{upload.admissionNumber}</span> · Level {upload.class} · Academic Track [{upload.subject}]
                    </p>
                    {upload.status === 'Rejected' && upload.rejectionReason && (
                      <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-xl mt-3 flex items-start gap-2 max-w-xl">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p><strong>Reviewer Notes:</strong> {upload.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-5 bg-gray-50/60 border border-gray-100/70 p-3 rounded-xl shrink-0 justify-between md:justify-start">
                    <div className="text-center min-w-[36px]">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">C.A</p>
                      <p className="font-black text-gray-900 text-sm mt-0.5">{upload.testScore}</p>
                    </div>
                    <div className="text-center min-w-[36px]">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Exam</p>
                      <p className="font-black text-gray-900 text-sm mt-0.5">{upload.examScore}</p>
                    </div>
                    <div className="text-center min-w-[40px] border-l border-gray-200/60 pl-4">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Total</p>
                      <p className="font-black text-primary text-base mt-0.5">{upload.totalScore}</p>
                    </div>
                    <div className="text-center min-w-[36px]">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Grade</p>
                      <p className="font-black text-gray-700 text-sm mt-0.5 bg-white px-1.5 py-0.5 rounded border border-gray-100 shadow-sm">{upload.grade}</p>
                    </div>
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