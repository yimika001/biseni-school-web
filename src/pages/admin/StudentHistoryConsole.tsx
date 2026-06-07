import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, Trash2, X } from 'lucide-react';
import axios from 'axios';

interface Props { 
  studentId: string; 
  adminToken: string; 
  onDeleteSuccess?: () => void;
  highlightQuery?: string; 
}

const StudentHistoryConsole = ({ studentId, adminToken, onDeleteSuccess }: Props) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Renamed states to force a clean break from old cached versions
  const [isSafeDeleteModalOpen, setIsSafeDeleteModalOpen] = useState(false);
  const [isUserAuthorizedDelete, setIsUserAuthorizedDelete] = useState(false);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setStudentData(res.data.student);
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    if (studentId) loadStudent();
  }, [studentId, adminToken]);

  const executeSafeDeletion = async () => {
    if (!isUserAuthorizedDelete) return;
    
    try {
      setIsDeletingProcess(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      alert("Success: Student record and credentials have been permanently removed.");
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) { 
      alert("Deletion failed: Could not remove record."); 
    } finally { 
      setIsDeletingProcess(false); 
      setIsSafeDeleteModalOpen(false);
      setIsUserAuthorizedDelete(false);
    }
  };

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-10" />;
  if (!studentData) return <div>Record unavailable.</div>;

  return (
    <div className="p-6">
      {/* EXPLICIT NEW TRIGGER */}
      <button 
        onClick={() => setIsSafeDeleteModalOpen(true)} 
        className="flex items-center gap-2 text-white bg-red-600 px-6 py-3 rounded-2xl hover:bg-red-700 transition font-black shadow-lg"
      >
        <Trash2 size={20} /> Delete Student Record
      </button>

      {/* MODAL */}
      {isSafeDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
            <h2 className="text-2xl font-black text-red-600 mb-4 flex items-center gap-3">
              <AlertTriangle /> Permanent Deletion
            </h2>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-sm text-red-900 font-medium">
              <p><strong>Name:</strong> {studentData.surname} {studentData.firstName}</p>
              <p><strong>Reg No:</strong> {studentData.admissionNumber}</p>
              <p><strong>Class:</strong> {studentData.class} | <strong>Dept:</strong> {studentData.department}</p>
              <hr className="my-2 border-red-200"/>
              <p className="italic">"You are about to permanently delete this student's record from the school portal. This action cannot be undone."</p>
            </div>

            <label className="flex gap-4 mb-8 cursor-pointer items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input 
                type="checkbox" 
                className="mt-1 w-6 h-6 accent-red-600"
                checked={isUserAuthorizedDelete} 
                onChange={(e) => setIsUserAuthorizedDelete(e.target.checked)} 
              />
              <span className="text-xs font-bold text-slate-800 leading-snug">
                I understand that I am permanently deleting the record of {studentData.surname} ({studentData.admissionNumber}). All data and login access will be removed.
              </span>
            </label>

            <div className="flex gap-4">
              <button onClick={() => setIsSafeDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-200 rounded-2xl font-bold">Cancel</button>
              <button 
                onClick={executeSafeDeletion}
                disabled={!isUserAuthorizedDelete || isDeletingProcess}
                className={`flex-1 py-4 rounded-2xl font-bold text-white transition ${isUserAuthorizedDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-300 cursor-not-allowed'}`}
              >
                {isDeletingProcess ? 'Processing...' : 'Confirm Permanent Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHistoryConsole;