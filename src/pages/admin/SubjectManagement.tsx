import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Save, Loader2, BookCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const CLASSES = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
const DEPARTMENTS = ['General', 'Science', 'Arts', 'Commerce'];

const SubjectManagement = () => {
  const { token } = useAuth();
  const [selectedClass, setSelectedClass] = useState('JSS1');
  const [selectedDept, setSelectedDept] = useState('General');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch function aligned with your app.ts /api/admin prefix
  const fetchCurrentSubjects = async (cls: string, dept: string) => {
    setFetching(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/subjects/${cls}/${dept}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns { subjects: [] }
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setSubjects([]); 
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCurrentSubjects(selectedClass, selectedDept);
  }, [selectedClass, selectedDept]);

  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    
    if (subjects.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error("Subject already exists!");
    }
    
    setSubjects([...subjects, trimmed]);
    setNewSubject('');
  };

  const removeSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const saveConfiguration = async () => {
    if (subjects.length === 0) {
      return toast.error("Please add at least one subject before saving.");
    }

    setLoading(true);
    try {
      // Body matches the destructuring in your controller: { classLevel, department, subjectList }
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/subjects`,
        {
          classLevel: selectedClass,
          department: selectedDept,
          subjectList: subjects
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${selectedClass} (${selectedDept}) CURRICULUM UPDATED`, {
        duration: 3000,
        position: 'top-center',
        style: { 
          background: '#059669', 
          color: '#fff', 
          fontWeight: '800',
          fontSize: '12px',
          borderRadius: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        },
        iconTheme: { primary: '#fff', secondary: '#059669' },
      });
    } catch (error: any) {
      console.error("Save error details:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update database. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      <Toaster />
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary/10 rounded-xl">
               <BookCheck className="text-primary" size={28} />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic underline decoration-primary/20">Curriculum</h1>
          </div>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            Editing Database: <span className="text-primary">{selectedClass}</span> <span className="mx-2 text-gray-200">|</span> {selectedDept}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL: SELECTION */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Select Class Level</label>
            <div className="grid grid-cols-3 gap-2">
              {CLASSES.map(c => (
                <button 
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${
                    selectedClass === c 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8 mb-4 italic">Department</label>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* PANEL: SUBJECT LIST */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm min-h-137.5 flex flex-col">
          
          <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
            <h3 className="font-black text-lg text-gray-800 uppercase flex items-center gap-2">
               <BookOpen size={20} className="text-primary" />
               Current Subjects
            </h3>
            {fetching && <Loader2 size={20} className="animate-spin text-primary" />}
          </div>

          <div className="flex gap-2 mb-8">
            <input 
              type="text" 
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Enter subject name..."
              className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-primary/20 focus:bg-white transition-all outline-none"
            />
            <button 
              onClick={handleAddSubject}
              className="bg-gray-900 text-white px-6 rounded-2xl hover:bg-primary active:scale-95 transition-all shadow-lg"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 flex-1 content-start">
            {fetching ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                 <Loader2 size={40} className="animate-spin text-primary/10" />
                 <p className="text-gray-400 text-[10px] mt-4 font-black uppercase tracking-widest">Querying database...</p>
              </div>
            ) : subjects.length > 0 ? (
              subjects.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-primary/20 hover:bg-white transition-all">
                  <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{sub}</span>
                  <button 
                    onClick={() => removeSubject(index)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <BookOpen className="text-gray-200 mb-2" size={32} />
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter text-center">
                  No Subjects Found<br/>
                  <span className="font-medium lowercase italic text-[12px]">Add entries to define curriculum</span>
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={saveConfiguration}
            disabled={loading || fetching}
            className="w-full py-5 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/10"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? 'Committing Changes...' : 'Save Configuration'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SubjectManagement;