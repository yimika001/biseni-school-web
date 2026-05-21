import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Explicitly Type Your Data Domain Architecture
interface AcademicRecord {
  _id: string;
  subject: string;
  class: string;
  testScore: number;
  examScore: number;
  totalScore: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  rejectionReason?: string;
}

interface StudentMeta {
  fullName: string;
  admissionNumber: string;
  class: string;
  isActive: boolean;
}

interface HistoryDictionary {
  [session: string]: {
    [term: string]: AcademicRecord[];
  };
}

interface TimelinePayload {
  totalRecordsFound: number;
  student: StudentMeta;
  history: HistoryDictionary;
}

interface StudentHistoryConsoleProps {
  studentId: string;
  adminToken: string;
}

const StudentHistoryConsole: React.FC<StudentHistoryConsoleProps> = ({ studentId, adminToken }) => {
  // Use the interface layout here to avoid implicit 'never' state inferences
  const [timelineData, setTimelineData] = useState<TimelinePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/results/student/${studentId}/admin-history`,
          {
            headers: { Authorization: `Bearer ${adminToken}` }
          }
        );
        setTimelineData(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching student history:", err);
        setError(err.response?.data?.message || "Failed to load academic records.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchStudentHistory();
  }, [studentId, adminToken]);

  if (loading) return <div className="p-6 text-center text-gray-500 font-medium">Compiling academic timeline history...</div>;
  if (error) return <div className="p-4 mx-6 my-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>;
  if (!timelineData || timelineData.totalRecordsFound === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 mx-6 my-4">
        <p className="text-lg font-semibold text-gray-700">No Academic History Found</p>
        <p className="text-sm text-gray-400 mt-1">This student profile exists, but no term results have been uploaded yet.</p>
      </div>
    );
  }

  const { student, history } = timelineData;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Student Meta Profile Card */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{student.fullName}</h2>
          <p className="text-blue-200 text-sm mt-0.5">ID: {student.admissionNumber} | Current/Last Class: {student.class}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          student.isActive 
            ? 'bg-emerald-500 text-white' 
            : 'bg-amber-500 text-gray-900'
        }`}>
          {student.isActive ? 'Active Student' : 'Alumni / Left School'}
        </span>
      </div>

      {/* Chronological Timeline Nested Double Map Loop */}
      <div className="space-y-10 relative before:absolute before:top-2 before:bottom-2 before:left-4 before:w-0.5 before:bg-gray-200">
        {Object.keys(history).map((session) => (
          <div key={session} className="relative pl-10 group">
            {/* Timeline node icon indicators */}
            <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-1 ring-blue-600/20 group-hover:scale-110 transition-transform"></div>
            
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{session} Academic Session</h3>

            <div className="mt-4 space-y-6">
              {Object.keys(history[session]).map((term) => (
                <div key={term} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded inline-block">
                    {term} Term
                  </h4>

                  {/* Complete Results Audit Grade Matrix Table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Subject</th>
                          <th className="px-4 py-3">Class Record</th>
                          <th className="px-4 py-3 text-center">CA Score (40)</th>
                          <th className="px-4 py-3 text-center">Exam (60)</th>
                          <th className="px-4 py-3 text-center">Total (100)</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                        {history[session][term].map((record: AcademicRecord) => (
                          <tr key={record._id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-gray-900">{record.subject}</td>
                            <td className="px-4 py-3.5 text-gray-500">{record.class}</td>
                            <td className="px-4 py-3.5 text-center text-gray-600 font-mono">{record.testScore}</td>
                            <td className="px-4 py-3.5 text-center text-gray-600 font-mono">{record.examScore}</td>
                            <td className="px-4 py-3.5 text-center font-bold font-mono text-gray-900">{record.totalScore}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                                record.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                record.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {record.status}
                              </span>
                              {record.status === 'Rejected' && (
                                <p className="text-[11px] text-rose-500 font-normal mt-1 italic max-w-xs mx-auto">
                                  Reason: {record.rejectionReason}
                                </p>
                              )}
                            </td>
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
    </div>
  );
};

export default StudentHistoryConsole;