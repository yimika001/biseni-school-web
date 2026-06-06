import { useEffect, useState } from 'react';
import { Loader2, Check, AlertCircle, Calendar, Award, FileText } from 'lucide-react';
import axios from 'axios';

interface StudentHistoryConsoleProps {
  studentId: string;
  adminToken: string;
  highlightQuery?: string;
}

// Reusable Highlight Component for consistent UI
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="bg-yellow-300 font-bold text-black px-0.5 rounded">{part}</span> 
          : part
      )}
    </>
  );
};

const StudentHistoryConsole = ({ studentId, adminToken, highlightQuery = '' }: StudentHistoryConsoleProps) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRecordIndex, setActiveRecordIndex] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string } | null>(null);

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
        setRecords(historyRes.data?.records || historyRes.data?.history || []);
      } catch (err: any) {
        setError("Failed to load academic timeline.");
      } finally {
        setLoading(false);
      }
    };
    if (studentId && adminToken) fetchStudentHistory();
  }, [studentId, adminToken]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] space-y-3">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Academic Records...</p>
    </div>
  );

  if (error || !profile) return (
    <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100">
      <AlertCircle size={28} className="mx-auto mb-2" />
      <p className="font-bold">Error loading student profile.</p>
    </div>
  );

  const displayName = `${profile.surname?.toUpperCase() || ''}, ${profile.firstName || ''} ${profile.middleName || ''}`.trim();
  const selectedRecord = records[activeRecordIndex];

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <Check size={20} /> <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            <HighlightText text={displayName} query={highlightQuery} />
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Admission ID: <span className="font-mono text-indigo-600">{profile.admissionNumber}</span>
          </p>
        </div>
        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
          <Award size={20} />
        </div>
      </div>

      {/* History Records Layout */}
      {records.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2 lg:max-h-[500px] lg:overflow-y-auto">
            {records.map((rec, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveRecordIndex(idx)} 
                className={`w-full text-left p-4 rounded-2xl border transition-all ${idx === activeRecordIndex ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest">{rec.term} Term</p>
                <p className="text-xs font-bold opacity-90">{rec.session}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-700">Academic Performance · {selectedRecord.term} Term</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Subject</th>
                  <th className="p-4 text-center">Total</th>
                  <th className="p-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedRecord.results?.map((res: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{res.subject}</td>
                    <td className="p-4 text-center font-mono font-bold text-indigo-600">{res.totalScore}</td>
                    <td className="p-4 text-center font-black text-emerald-600">{res.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
          <FileText className="mx-auto mb-2" />
          <p className="font-bold">No academic history available.</p>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryConsole;