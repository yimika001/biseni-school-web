import { useState, useEffect } from 'react';
import { Search, Award, BookOpen, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Result {
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
}

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  department: string;
}

const StudentResults = () => {
  const { token } = useAuth();
  const [viewMode, setViewMode] = useState<'form' | 'report'>('form');
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [selectedTerm, setSelectedTerm] = useState('First');
  const [results, setResults] = useState<Result[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [average, setAverage] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data.profile);
      } catch (error) {
        console.error('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, [token]);

  const handleFetchResults = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/results/${profile._id}/${selectedTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { session: selectedSession },
        }
      );
      setResults(response.data.results);
      setAverage(response.data.average);
      setViewMode('report');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No approved results found for this term and session. Please check back later.');
      } else {
        setError('Failed to fetch results. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (['A1', 'B2', 'B3'].includes(grade)) return 'bg-green-50 text-green-700';
    if (['C4', 'C5', 'C6'].includes(grade)) return 'bg-blue-50 text-blue-700';
    if (['D7', 'E8'].includes(grade)) return 'bg-orange-50 text-orange-700';
    return 'bg-red-50 text-red-700';
  };

  if (viewMode === 'form') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Award size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Check Your Result</h2>
          <p className="text-gray-500 text-sm mb-8">
            Select the term and session to view your academic performance.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 font-bold text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-primary font-bold"
              >
                <option>2025/2026</option>
                <option>2024/2025</option>
                <option>2023/2024</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Terminal Period</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-primary font-bold"
              >
                <option value="First">First Term</option>
                <option value="Second">Second Term</option>
                <option value="Third">Third Term</option>
              </select>
            </div>
            <button
              onClick={handleFetchResults}
              disabled={loading || !profile}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search size={20} /> {loading ? 'Loading...' : 'View Report Card'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      {/* Back Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setViewMode('form')}
          className="text-sm font-bold text-primary hover:underline"
        >
          ← Back to Selection
        </button>
      </div>

      {/* Report Card */}
      <div className="bg-white border-4 border-double border-gray-100 rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-primary p-8 text-white text-center relative">
          <div className="absolute top-4 right-4 opacity-10"><Award size={80} /></div>
          <h3 className="text-xl font-bold uppercase tracking-widest">Biseni Secondary School</h3>
          <p className="text-sm opacity-80 mt-1">Kalama, Yenagoa LGA · Bayelsa State, Nigeria</p>
          <div className="mt-6 inline-block bg-white/20 px-6 py-2 rounded-full font-bold text-sm">
            {selectedTerm} Term Report Card — {selectedSession}
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Student Info */}
          <div className="flex flex-wrap gap-6 mb-10 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <User className="text-gray-300" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Student Name</p>
                <p className="font-bold text-gray-800 uppercase">
                  {profile?.firstName} {profile?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="text-gray-300" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Class / Admission No.</p>
                <p className="font-bold text-gray-800 uppercase">
                  {profile?.class} / {profile?.admissionNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="text-gray-300" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Department</p>
                <p className="font-bold text-gray-800 uppercase">{profile?.department}</p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase border-b">
                  <th className="pb-4">Subject</th>
                  <th className="pb-4 text-center">C.A (40)</th>
                  <th className="pb-4 text-center">Exam (60)</th>
                  <th className="pb-4 text-center">Total</th>
                  <th className="pb-4 text-center">Grade</th>
                  <th className="pb-4 text-center">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((res) => (
                  <tr key={res._id} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold text-gray-700">{res.subject}</td>
                    <td className="py-4 text-center font-medium">{res.testScore}</td>
                    <td className="py-4 text-center font-medium">{res.examScore}</td>
                    <td className="py-4 text-center font-black text-primary">{res.totalScore}</td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-xs ${getGradeColor(res.grade)}`}>
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-4 text-center text-xs font-bold text-gray-500">{res.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase">Principal's Remark</p>
              <p className="font-bold text-gray-700 italic">
                {Number(average) >= 75
                  ? '"An outstanding performance. Keep maintaining the standard."'
                  : Number(average) >= 50
                  ? '"A good performance. Strive for greater heights."'
                  : '"More effort is required. Speak with your class teacher."'}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Overall Average</p>
              <p className="text-3xl font-black text-primary">{average}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;