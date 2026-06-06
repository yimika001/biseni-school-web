import { useEffect, useState } from 'react';
import { Loader2, Calendar, Award, FileText, BookOpen, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';

interface StudentHistoryConsoleProps {
  studentId: string;
  adminToken: string;
}

interface AcademicRecord {
  term: string;
  session: string;
  class: string;
  attendance?: { present: number; absent: number; };
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
  name?: string;
  surname: string;
  firstName: string;
  middleName?: string;
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
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Helper to trigger the 30-second toast
  const triggerToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 30000);
  };

  useEffect(() => {
    const fetchStudentHistory = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${adminToken}` } };
        const [profileRes, historyRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}/history`, config).catch(() => ({ data: { records: [] } }))
        ]);

        setProfile(profileRes.data?.student || profileRes.data?.data || profileRes.data);
        const historyRecords = historyRes.data?.records || historyRes.data?.history || (Array.isArray(historyRes.data) ? historyRes.data : []);
        setRecords(historyRecords);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load academic timeline.");
      } finally {
        setLoading(false);
      }
    };
    if (studentId && adminToken) fetchStudentHistory();
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
        <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-xl border border-red-100"><AlertCircle size={28} /></div>
        <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">Archival Fetch Failed</h3>
      </div>
    );
  }

  // Consistent Full Name Display: Surname, Firstname Middlename
  const displayName = `${profile.surname?.toUpperCase() || ''}, ${profile.firstName || ''} ${profile.middleName || ''}`.trim();
  const selectedRecord = records[activeRecordIndex];

  return (
    <div className="p-6 md:p-8 space-y-6 relative">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Check size={20} />
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Mini Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">{displayName}</h2>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${profile.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              {profile.isActive !== false ? 'Active' : 'Alumni'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Admission ID: <span className="font-mono text-slate-700 font-black">{profile.admissionNumber || 'Unassigned'}</span> · Current Class: <span className="text-slate-700 font-black">{profile.class || 'N/A'}</span>
          </p>
        </div>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {records.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => setActiveRecordIndex(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${idx === activeRecordIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200'}`}
              >
                <p className="text-xs font-black uppercase">{rec.term} Term</p>
                <p className="text-[10px] font-bold opacity-80">{rec.session} · {rec.class}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase">
                      <th className="p-4">Subject</th>
                      <th className="p-4 text-center">C.A.</th>
                      <th className="p-4 text-center">Exam</th>
                      <th className="p-4 text-center">Total</th>
                      <th className="p-4 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.results?.map((res, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-4 font-black">{res.subject}</td>
                        <td className="p-4 text-center font-mono">{res.caScore}</td>
                        <td className="p-4 text-center font-mono">{res.examScore}</td>
                        <td className="p-4 text-center font-bold">{res.totalScore}</td>
                        <td className="p-4 text-center font-black text-emerald-600">{res.grade}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryConsole;