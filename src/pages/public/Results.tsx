import { useState } from 'react';
import { Search, Download, Printer, Award, BookOpen, User } from 'lucide-react';

const StudentResults = () => {
  const [viewMode, setViewMode] = useState<'form' | 'report'>('form');

  const mockResult = [
    { subject: 'Mathematics', test: 28, exam: 52, total: 80, grade: 'A1', remark: 'Excellent' },
    { subject: 'English Language', test: 24, exam: 46, total: 70, grade: 'B2', remark: 'Very Good' },
    { subject: 'Physics', test: 20, exam: 45, total: 65, grade: 'B3', remark: 'Good' },
    { subject: 'Civic Education', test: 30, exam: 55, total: 85, grade: 'A1', remark: 'Excellent' },
  ];

  if (viewMode === 'form') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Award size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Check Your Result</h2>
          <p className="text-gray-500 text-sm mb-8">Select the term and session to view your academic performance.</p>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Academic Session</label>
              <select className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-primary font-bold">
                <option>2025/2026</option>
                <option>2024/2025</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Terminal Period</label>
              <select className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-primary font-bold">
                <option>First Term</option>
                <option>Second Term</option>
                <option>Third Term</option>
              </select>
            </div>
            <button 
              onClick={() => setViewMode('report')}
              className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Search size={20} /> View Report Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      {/* Report Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setViewMode('form')} className="text-sm font-bold text-primary hover:underline">
          ← Back to Selection
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50"><Printer size={18} /></button>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Digital Report Card */}
      <div className="bg-white border-4 border-double border-gray-100 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-primary p-8 text-white text-center relative">
          <div className="absolute top-4 right-4 opacity-10"><Award size={80} /></div>
          <h3 className="text-xl font-bold uppercase tracking-widest">Biseni Secondary School</h3>
          <p className="text-sm opacity-80 mt-1">Bayelsa State, Nigeria</p>
          <div className="mt-6 inline-block bg-white/20 px-6 py-2 rounded-full font-bold">
            First Term Report Card - 2025/2026
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Student Info Bar */}
          <div className="flex flex-wrap gap-6 mb-10 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <User className="text-gray-300" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Student Name</p>
                <p className="font-bold text-gray-800 uppercase">Oladipupo Precious</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="text-gray-300" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Class/Reg No</p>
                <p className="font-bold text-gray-800 uppercase">SS3 / BSS-2026-001</p>
              </div>
            </div>
          </div>

          {/* Scores Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase border-b">
                  <th className="pb-4">Subject</th>
                  <th className="pb-4 text-center">C.A</th>
                  <th className="pb-4 text-center">Exam</th>
                  <th className="pb-4 text-center">Total</th>
                  <th className="pb-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockResult.map((res, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-4 font-bold text-gray-700">{res.subject}</td>
                    <td className="py-4 text-center font-medium">{res.test}</td>
                    <td className="py-4 text-center font-medium">{res.exam}</td>
                    <td className="py-4 text-center font-black text-primary">{res.total}</td>
                    <td className="py-4 text-center">
                      <span className="bg-primary/5 text-primary px-3 py-1 rounded-lg font-black text-xs">
                        {res.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase">Principal's Remark</p>
              <p className="font-bold text-gray-700 italic">"An outstanding performance. Keep maintaining the standard."</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Overall Average</p>
              <p className="text-3xl font-black text-primary">75.0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;