import { useEffect, useState } from 'react';
import { Loader2, Calendar, Award, FileText, BookOpen, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface StudentHistoryConsoleProps {
  studentId: string;
  adminToken: string;
}

interface AcademicRecord {
  term: string;
  session: string;
  class: string;
  attendance?: {
    present: number;
    absent: number;
  };
  results: Array<{
    subject: string;
    caScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
    remarks: string;
  }>;
  averageScore?: number;
  principalRemarks?: string;
}

interface StudentProfile {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  isActive: boolean;
}

const StudentHistoryConsole = ({ studentId, adminToken }: StudentHistoryConsoleProps) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRecordIndex, setActiveRecordIndex] = useState<number>(0);

  useEffect(() => {
    const fetchStudentHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch student profile details and academic history in parallel
        const [profileRes, historyRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}/history`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          })
        ]);

        // Adjust these lines if your backend returns data wrapped differently (e.g., profileRes.data.student)
        setProfile(profileRes.data.student || profileRes.data);
        setRecords(historyRes.data.records || historyRes.data || []);
      } catch (err) {
        console.error('Error fetching archival data:', err);
        setError('Failed to load this student\'s academic timeline. Please verify backend routes.');
      } finally {
        setLoading(false);
      }
    };

    if (studentId && adminToken) {
      fetchStudentHistory();
    }
  }, [studentId, adminToken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-3">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Retrieving Academic Archive...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Archival Fetch Failed</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{error || 'Could not find profile metadata.'}</p>
      </div>
    );
  }

  const selectedRecord = records[activeRecordIndex];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Mini Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">{profile.lastName}, {profile.firstName}</h2>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
              profile.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {profile.isActive ? 'Active' : 'Alumni'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Admission ID: <span className="font-mono text-slate-700 font-black">{profile.admissionNumber}</span> · Current Class Placement: <span className="text-slate-700 font-black">{profile.class}</span>
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl text-center sm:text-right min-w-[140px]">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Total Terms Logged</span>
          <span className="text-xl font-black text-indigo-700">{records.length}</span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 max-w-md mx-auto">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-bold uppercase tracking-wider text-slate-600">No Term Archives Found</p>
          <p className="text-xs text-slate-400 mt-1">This student profile exists, but no historical term summaries or report sheets have been published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Side: Term Select Navigation */}
          <div className="lg:col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-2">Select Archive Window</span>
            {records.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => setActiveRecordIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  idx === activeRecordIndex
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <p className={`text-xs font-black uppercase tracking-wide ${idx === activeRecordIndex ? 'text-white' : 'text-slate-800'}`}>
                    {rec.term} Term
                  </p>
                  <p className={`text-[10px] font-bold ${idx === activeRecordIndex ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {rec.session} · {rec.class}
                  </p>
                </div>
                <Calendar size={14} className={idx === activeRecordIndex ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-600'} />
              </button>
            ))}
          </div>

          {/* Right Side: Data Record Viewer */}
          <div className="lg:col-span-3 space-y-4 animate-in fade-in duration-200">
            {selectedRecord && (
              <>
                {/* Meta Highlights Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                      <Award size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Performance Average</span>
                      <p className="text-base font-black text-slate-800">{selectedRecord.averageScore ? `${selectedRecord.averageScore}%` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Classes Audited</span>
                      <p className="text-base font-black text-slate-800">{selectedRecord.results.length} Subjects</p>
                    </div>
                  </div>
                </div>

                {/* Main Results Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          <th className="p-4">Subject</th>
                          <th className="p-4 text-center">C.A. (40)</th>
                          <th className="p-4 text-center">Exam (60)</th>
                          <th className="p-4 text-center">Total (100)</th>
                          <th className="p-4 text-center">Grade</th>
                          <th className="p-4 hidden sm:table-cell">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {selectedRecord.results.map((res, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-black text-slate-800 uppercase">{res.subject}</td>
                            <td className="p-4 text-center font-mono">{res.caScore}</td>
                            <td className="p-4 text-center font-mono">{res.examScore}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-900">{res.totalScore}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                res.grade.startsWith('A') || res.grade.startsWith('B')
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : res.grade.startsWith('C') || res.grade.startsWith('P')
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                {res.grade}
                              </span>
                            </td>
                            <td className="p-4 hidden sm:table-cell text-slate-500 text-[11px] italic font-medium">{res.remarks || 'No remarks logged'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Instructor/Principal Feedback Footer */}
                {selectedRecord.principalRemarks && (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs font-medium">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Administrative Endorsement Summary</span>
                    <p className="text-slate-600 italic">"{selectedRecord.principalRemarks}"</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryConsole;