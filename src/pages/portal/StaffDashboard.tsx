import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Bell,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface StaffProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  subjects: string[];
  staffId: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

interface UploadedResult {
  _id: string;
  studentId: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class: string;
  };
  subject: string;
  class: string;
  testScore: number;
  examScore: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
}

const StaffDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [uploads, setUploads] = useState<UploadedResult[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, announcementsRes, studentsRes, uploadsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/announcements/public`),
          axios.get(`${import.meta.env.VITE_API_URL}/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/results/my-uploads`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(meRes.data.profile);
        setAnnouncements(announcementsRes.data.announcements.slice(0, 3));
        setStudentCount(studentsRes.data.count);
        
        // Handle result status state payload
        if (uploadsRes.data.isLocked) {
          setIsLocked(true);
          setLockMessage(uploadsRes.data.message);
          setUploads([]);
        } else {
          setIsLocked(false);
          setUploads(uploadsRes.data.results || []);
        }
      } catch (error) {
        console.error('Failed to fetch staff dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase">
            Welcome, {user?.name?.split(' ')[0] || 'Instructor'}
          </h2>
          <p className="text-gray-500 text-sm">
            {profile ? `${profile.department} Department · ${profile.staffId}` : 'Loading profile...'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-primary p-5 rounded-3xl text-white shadow-lg shadow-primary/20">
          <BookOpen className="mb-3 opacity-80" size={24} />
          <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest">My Subjects</p>
          <p className="text-2xl font-black">
            {loading ? '...' : profile?.subjects?.length ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <Users className="mb-3 text-primary" size={24} />
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Students</p>
          <p className="text-2xl font-black text-gray-900">
            {loading ? '...' : studentCount}
          </p>
        </div>

        <div
          onClick={() => !isLocked && navigate('/staff/results')}
          className={`p-5 rounded-3xl border shadow-sm transition-all flex flex-col justify-between ${
            isLocked 
              ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
              : 'bg-white border-gray-100 cursor-pointer hover:border-primary/30 hover:shadow-md'
          }`}
        >
          <div>
            <FileSpreadsheet className={`mb-3 ${isLocked ? 'text-gray-400' : 'text-primary'}`} size={24} />
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Upload Results</p>
          </div>
          <p className="text-sm font-black text-primary mt-2">
            {isLocked ? '❌ Locked' : 'Go →'}
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          
          {/* My Uploads Tracking Section */}
          <div>
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-widest">
              My Uploads Tracking <FileSpreadsheet size={16} className="text-primary" />
            </h3>

            {loading ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm font-medium">
                Loading workspace uploads...
              </div>
            ) : isLocked ? (
              // Polished Lock Notice State View
              <div className="bg-blue-50/60 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center flex flex-col items-center shadow-sm">
                <div className="bg-blue-500 text-white p-3 rounded-2xl mb-4 shadow-md shadow-blue-500/20">
                  <Lock size={24} />
                </div>
                <h4 className="text-blue-900 font-black uppercase text-sm tracking-wider mb-2">Term Records Finalized</h4>
                <p className="text-blue-700/90 text-xs font-semibold max-w-md leading-relaxed">
                  {lockMessage || "Academic records for this term have been finalized and locked by the administration."}
                </p>
              </div>
            ) : uploads.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm font-medium">
                No scores uploaded yet for this active term.
              </div>
            ) : (
              // Live Interactive Tracking Log View Sheet
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider">
                        <th className="p-4">Student</th>
                        <th className="p-4">Class</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4 text-center">Scores (CA/Exam)</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-bold text-gray-700">
                      {uploads.map((row) => (
                        <tr key={row._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4 text-gray-900 uppercase">
                            {row.studentId ? `${row.studentId.firstName} ${row.studentId.lastName}` : 'Unknown Student'}
                          </td>
                          <td className="p-4 uppercase text-gray-500">{row.class}</td>
                          <td className="p-4 uppercase text-primary">{row.subject}</td>
                          <td className="p-4 text-center font-black text-gray-900 bg-gray-50/40">
                            {row.testScore} / {row.examScore}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              row.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              row.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {row.status}
                            </span>
                            {row.status === 'Rejected' && row.rejectionReason && (
                              <p className="text-[10px] text-red-500 font-medium mt-1 normal-case flex items-center gap-1">
                                <AlertCircle size={10} /> {row.rejectionReason}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* My Assigned Subjects Layout list */}
          <div>
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-widest">
              My Assigned Subjects <ArrowRight size={16} className="text-primary" />
            </h3>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Loading...</div>
            ) : profile?.subjects && profile.subjects.length > 0 ? (
              <div className="space-y-4">
                {profile.subjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:border-primary/50 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 uppercase text-sm">{subject}</h4>
                        <p className="text-xs text-gray-500 font-medium">{profile.department} Department</p>
                      </div>
                    </div>
                    <button
                      disabled={isLocked}
                      onClick={() => navigate('/staff/results')}
                      className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all ${
                        isLocked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {isLocked ? 'Locked' : 'Upload Scores'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-bold text-sm">No subjects assigned yet.</p>
                <p className="text-gray-400 text-xs mt-1">Contact admin to assign subjects to your profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notices Panel sidebar */}
        <div className="lg:col-span-1">
          <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-widest">
            School Notices <Bell size={18} className="text-orange-500" />
          </h3>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            {loading ? (
              <p className="text-xs text-gray-400 text-center">Loading notices...</p>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-gray-400 text-center">No notices at this time.</p>
            ) : (
              <div className="space-y-5">
                {announcements.map((item, i) => (
                  <div key={item._id} className={`flex gap-4 ${i > 0 ? 'border-t border-gray-50 pt-4' : ''}`}>
                    <div className="mt-1 shrink-0">
                      <CheckCircle2 size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-800 font-bold leading-relaxed">{item.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/news')}
              className="w-full py-3 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black hover:bg-gray-100 transition-all uppercase tracking-widest mt-6"
            >
              View All Notices
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;