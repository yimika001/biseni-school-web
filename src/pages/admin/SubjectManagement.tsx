import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Save, Loader2, BookCheck, Layers, ClipboardList } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const CLASSES = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

interface ClassSummary {
  classLevel: string;
  department: string;
  subjects: string[];
}

const SubjectManagement = () => {
  const { token } = useAuth();
  const [selectedClass, setSelectedClass] = useState('JSS1');
  const [selectedDept, setSelectedDept] = useState('General');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // Dashboard overall view tracking states
  const [allCurriculums, setAllCurriculums] = useState<ClassSummary[]>([]);
  const [fetchingSummary, setFetchingSummary] = useState(false);

  // Dynamic department options based on Nigerian academic structure
  const isJuniorClass = selectedClass.startsWith('JSS');
  const departmentsAvailable = isJuniorClass ? ['General'] : ['Science', 'Arts'];

  // Automatically safe-guard department selections when switching between JSS and SS levels
  useEffect(() => {
    if (isJuniorClass) {
      setSelectedDept('General');
    } else {
      setSelectedDept('Science');
    }
  }, [selectedClass]);

  // Fetch functions aligned with your backend router paths
  const fetchCurrentSubjects = async (cls: string, dept: string) => {
    setFetching(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/subjects/${cls}/${dept}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setSubjects([]); 
    } finally {
      setFetching(false);
    }
  };

  // Pulls data for all existing combinations to build out the overview dashboard panel
  const fetchAllCurriculumsSummary = async () => {
    setFetchingSummary(true);
    const summaryData: ClassSummary[] = [];
    
    try {
      // Loop through assignments to gather a master curriculum view for the admin
      for (const cls of CLASSES) {
        const depts = cls.startsWith('JSS') ? ['General'] : ['Science', 'Arts'];
        for (const dept of depts) {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/admin/subjects/${cls}/${dept}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.subjects && res.data.subjects.length > 0) {
              summaryData.push({
                classLevel: cls,
                department: dept,
                subjects: res.data.subjects
              });
            }
          } catch (e) {
            // Silence isolated missing track records
          }
        }
      }
      setAllCurriculums(summaryData);
    } catch (err) {
      console.error("Error gathering dashboard matrix summaries:", err);
    } finally {
      setFetchingSummary(false);
    }
  };

  useEffect(() => {
    fetchCurrentSubjects(selectedClass, selectedDept);
  }, [selectedClass, selectedDept]);

  useEffect(() => {
    fetchAllCurriculumsSummary();
  }, []);

  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    
    if (subjects.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error("Subject already exists!");
    }
    
    setSubjects([...subjects, trimmed]);
    newSubject && setNewSubject('');
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

      // Refresh master summary board automatically on save
      fetchAllCurriculumsSummary();
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
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

            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8 mb-4 italic">Department Allocation</label>
            <div className="relative">
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={isJuniorClass}
                className={`w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none ${isJuniorClass ? 'text-gray-400 cursor-not-allowed font-medium' : 'text-gray-700'}`}
              >
                {departmentsAvailable.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Layers size={16} className="text-gray-400" />
              </div>
            </div>
            {isJuniorClass && (
              <p className="text-[10px] text-gray-400 mt-2 font-medium italic">* Junior classes default exclusively to General subject assignments.</p>
            )}
          </div>
        </div>

        {/* PANEL: SUBJECT LIST EDITOR */}
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
              placeholder="Enter subject name (e.g. Mathematics, Biology)..."
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

      {/* NEW PANEL: COMPREHENSIVE CURRICULUM LIVE TRACKER OVERVIEW */}
      <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
          <h2 className="font-black text-xl text-gray-900 uppercase flex items-center gap-2 tracking-tight">
            <ClipboardList size={22} className="text-primary" />
            Class Curriculums Live Matrix
          </h2>
          {fetchingSummary && <Loader2 size={18} className="animate-spin text-primary" />}
        </div>

        {fetchingSummary && allCurriculums.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-primary/40" size={32} />
          </div>
        ) : allCurriculums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCurriculums.map((curriculum, idx) => (
              <div key={idx} className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-black text-gray-900 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">{curriculum.classLevel}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider ${
                      curriculum.department === 'Science' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      curriculum.department === 'Arts' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {curriculum.department}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4 max-h-40 overflow-y-auto pr-1">
                    {curriculum.subjects.map((s, sIdx) => (
                      <span key={sIdx} className="text-[11px] font-bold bg-white text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100 uppercase tracking-tight">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100/70 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{curriculum.subjects.length} Subjects Registered</span>
                  <button 
                    onClick={() => {
                      setSelectedClass(curriculum.classLevel);
                      setSelectedDept(curriculum.department);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-extrabold text-primary hover:underline uppercase tracking-tight"
                  >
                    Edit Matrix
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-100 rounded-3xl bg-gray-50/20">
            <p className="text-gray-400 font-bold text-xs uppercase">No Active Curriculum Maps Formed Yet</p>
            <p className="text-gray-400 font-medium text-xs italic mt-1">Configure individual levels using the workspace generator tool above.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SubjectManagement;