import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, BookOpen, User, Hash, GraduationCap, Calendar, Award } from 'lucide-react';
import axios from 'axios';

interface Props {
  studentId: string;
  adminToken: string;
  onDeleteSuccess?: () => void;
  highlightQuery?: string;
  onClose?: () => void;
}

interface ResultRecord {
  _id: string;
  subject: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
  term: string;
  session: string;
  class: string;
  status: string;
}

const gradeColor = (grade: string) => {
  if (['A1', 'B2', 'B3'].includes(grade)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['C4', 'C5', 'C6'].includes(grade)) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (['D7', 'E8'].includes(grade)) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

const StudentHistoryConsole = ({ studentId, adminToken, onDeleteSuccess, onClose }: Props) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<{ term: string; session: string } | null>(null);

  // Delete modal state
  const [isSafeDeleteModalOpen, setIsSafeDeleteModalOpen] = useState(false);
  const [isUserAuthorizedDelete, setIsUserAuthorizedDelete] = useState(false);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        const [studentRes, termRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/active-term`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          }),
        ]);

        const student = studentRes.data.student;
        setStudentData(student);

        const termData = termRes.data;
        setActiveTerm({
          term: termData.term || termData.activeTerm?.term || '—',
          session: termData.session || termData.activeTerm?.session || '—',
        });

        // Fetch all approved results for this student
        try {
          const resultsRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/results/student/${studentId}/all`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          // Results come back grouped; flatten them
          const grouped = resultsRes.data.grouped || {};
          const flat: ResultRecord[] = [];
          Object.entries(grouped).forEach(([, termData]: any) => {
            Object.entries(termData).forEach(([, records]: any) => {
              flat.push(...records);
            });
          });
          setResults(flat);
        } catch {
          // No results yet — that's fine, show empty state
          setResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) loadAll();
  }, [studentId, adminToken]);

  const executeSafeDeletion = async () => {
    if (!isUserAuthorizedDelete) return;
    try {
      setIsDeletingProcess(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (onDeleteSuccess) onDeleteSuccess();
      if (onClose) onClose();
    } catch {
      alert('Deletion failed. Could not remove record.');
    } finally {
      setIsDeletingProcess(false);
      setIsSafeDeleteModalOpen(false);
      setIsUserAuthorizedDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertTriangle size={32} className="mb-3" />
        <p className="font-bold text-sm">Student record unavailable.</p>
      </div>
    );
  }

  const fullName = [studentData.surname?.toUpperCase(), studentData.firstName, studentData.middleName]
    .filter(Boolean).join(' ');

  // Group results by session → term for display
  const grouped: Record<string, Record<string, ResultRecord[]>> = {};
  results.forEach(r => {
    if (!grouped[r.session]) grouped[r.session] = {};
    if (!grouped[r.session][r.term]) grouped[r.session][r.term] = [];
    grouped[r.session][r.term].push(r);
  });

  return (
    <div className="p-6 space-y-6">

      {/* Student Info Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-4 -right-4 opacity-10">
          <GraduationCap size={100} />
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Student Profile</p>
            <h2 className="text-xl font-black leading-tight">{fullName}</h2>
            <p className="text-indigo-200 text-sm font-bold mt-1">{studentData.admissionNumber}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${studentData.isActive ? 'bg-emerald-400/20 text-emerald-200' : 'bg-red-400/20 text-red-200'}`}>
            {studentData.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: BookOpen, label: 'Class', value: studentData.class },
            { icon: Award, label: 'Department', value: studentData.department },
            { icon: User, label: 'Gender', value: studentData.gender || '—' },
            { icon: Calendar, label: 'Admission Year', value: studentData.admissionYear || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={11} className="text-indigo-200" />
                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Term Info */}
      {activeTerm && (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <Hash size={14} className="text-indigo-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Academic Term</p>
            <p className="text-sm font-black text-slate-700">{activeTerm.term} Term · {activeTerm.session}</p>
          </div>
        </div>
      )}

      {/* Academic Results */}
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Academic Records</p>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-500 text-sm">No results on record</p>
            <p className="text-xs text-slate-400 mt-1">Approved results will appear here once uploaded and approved.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([session, termData]) => (
                <div key={session}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {session}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <div className="space-y-3">
                    {Object.entries(termData)
                      .sort(([a], [b]) => {
                        const order = ['First', 'Second', 'Third'];
                        return order.indexOf(a) - order.indexOf(b);
                      })
                      .map(([term, records]) => (
                        <div key={term} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{term} Term</p>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-50">
                                  <th className="px-4 py-3">Subject</th>
                                  <th className="px-3 py-3 text-center">C.A</th>
                                  <th className="px-3 py-3 text-center">Exam</th>
                                  <th className="px-3 py-3 text-center">Total</th>
                                  <th className="px-3 py-3 text-center">Grade</th>
                                  <th className="px-4 py-3">Remark</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {records.map(r => (
                                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-700 text-sm capitalize">{r.subject}</td>
                                    <td className="px-3 py-3 text-center text-xs text-slate-500 font-medium">{r.testScore}</td>
                                    <td className="px-3 py-3 text-center text-xs text-slate-500 font-medium">{r.examScore}</td>
                                    <td className="px-3 py-3 text-center font-black text-indigo-600 text-sm">{r.totalScore}</td>
                                    <td className="px-3 py-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${gradeColor(r.grade)}`}>
                                        {r.grade}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400 font-medium">{r.remark}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Delete Section */}
      <div className="border-t border-slate-100 pt-6">
        <button
          onClick={() => setIsSafeDeleteModalOpen(true)}
          className="flex items-center gap-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
        >
          <AlertTriangle size={15} /> Delete Student Record
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isSafeDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-red-600 mb-4 flex items-center gap-3">
              <AlertTriangle size={22} /> Permanent Deletion
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-900 font-medium space-y-1">
              <p><strong>Name:</strong> {fullName}</p>
              <p><strong>Reg No:</strong> {studentData.admissionNumber}</p>
              <p><strong>Class:</strong> {studentData.class} · <strong>Dept:</strong> {studentData.department}</p>
              <hr className="my-2 border-red-200" />
              <p className="italic text-xs">You are about to permanently delete this student's record. This action cannot be undone.</p>
            </div>

            <label className="flex gap-3 mb-6 cursor-pointer items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-red-600 shrink-0"
                checked={isUserAuthorizedDelete}
                onChange={(e) => setIsUserAuthorizedDelete(e.target.checked)}
              />
              <span className="text-xs font-bold text-slate-700 leading-snug">
                I understand I am permanently deleting {studentData.surname} ({studentData.admissionNumber}). All data and login access will be removed.
              </span>
            </label>

            <div className="flex gap-3">
              <button onClick={() => setIsSafeDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
              <button
                onClick={executeSafeDeletion}
                disabled={!isUserAuthorizedDelete || isDeletingProcess}
                className="flex-1 py-3 rounded-xl font-bold text-white transition-all bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isDeletingProcess ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryConsole;