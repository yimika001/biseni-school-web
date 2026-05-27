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
  
  // Dashboard summaries tracking states
  const [allCurriculums, setAllCurriculums] = useState<ClassSummary[]>([]);
  const [fetchingSummary, setFetchingSummary] = useState(false);

  // 🎯 STRICT STRUCTURAL RULE: Junior classes get General. Senior classes get ONLY Science and Arts.
  const isJuniorClass = selectedClass.startsWith('JSS');
  const departmentsAvailable = isJuniorClass ? ['General'] : ['Science', 'Arts'];

  // Dynamically switch state default when toggling between senior/junior levels
  useEffect(() => {
    if (isJuniorClass) {
      setSelectedDept('General');
    } else {
      setSelectedDept('Science');
    }
  }, [selectedClass, isJuniorClass]);

  // Fetch current working subjects for the workspace selection
  const fetchCurrentSubjects = async (cls: string, dept: string) => {
    const activeToken = token || localStorage.getItem('bss_token'); 
    if (!activeToken || activeToken === 'null') return;
    if (!cls.startsWith('JSS') && dept === 'General') return;
    if (cls.startsWith('JSS') && dept !== 'General') return;

    setFetching(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/subjects/${cls}/${dept}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      
      let parsedSubjects: string[] = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          parsedSubjects = res.data;
        } else if (res.data.subjects && Array.isArray(res.data.subjects)) {
          parsedSubjects = res.data.subjects;
        } else if (res.data.data && Array.isArray(res.data.data.subjects)) {
          parsedSubjects = res.data.data.subjects;
        }
      }
      setSubjects(parsedSubjects);
    } catch (error: any) {
      console.error("Fetch error:", error);
      setSubjects([]); 
    } finally {
      setFetching(false);
    }
  };

  // Pulls clean matrix data for all classes
  const fetchAllCurriculumsSummary = async () => {
    const activeToken = token || localStorage.getItem('bss_token');
    if (!activeToken || activeToken === 'null') return;
    
    setFetchingSummary(true);
    const summaryData: ClassSummary[] = [];
    
    try {
      for (const cls of CLASSES) {
        const depts = cls.startsWith('JSS') ? ['General'] : ['Science', 'Arts'];
        for (const dept of depts) {
          try {
            const res = await axios.get(
              `${import.meta.env.VITE_API_URL}/admin/subjects/${cls}/${dept}`,
              { headers: { Authorization: `Bearer ${activeToken}` } }
            );
            
            // 🔍 SAFELY MATCH BACKEND PACKET OUTPUT VARIATIONS
            let rawSubjects: string[] = [];
            if (res.data) {
              if (Array.isArray(res.data)) {
                rawSubjects = res.data;
              } else if (res.data.subjects && Array.isArray(res.data.subjects)) {
                rawSubjects = res.data.subjects;
              } else if (res.data.data && Array.isArray(res.data.data.subjects)) {
                rawSubjects = res.data.data.subjects;
              }
            }

            // Always retain structural visibility over the card grid ecosystem
            summaryData.push({
              classLevel: cls,
              department: dept,
              subjects: rawSubjects
            });
          } catch (e) {
            console.error(`Skipping or empty stream config for ${cls}-${dept}`);
          }
        }
      }
      setAllCurriculums(summaryData);
    } catch (err) {
      console.error("Error gathering dashboard summaries:", err);
    } finally {
      setFetchingSummary(false);
    }
  };

  // Monitor workspace adjustments safely without clearing data during active saves
  useEffect(() => {
    const activeToken = token || localStorage.getItem('bss_token');
    const balancedDept = selectedClass.startsWith('JSS') ? 'General' : (selectedDept === 'General' ? 'Science' : selectedDept);

    if (activeToken && activeToken !== 'null') {
      fetchCurrentSubjects(selectedClass, balancedDept);
    }
  }, [selectedClass, selectedDept, token]);

  // Initial load tracking hook
  useEffect(() => {
    const activeToken = token || localStorage.getItem('bss_token');
    if (activeToken && activeToken !== 'null') {
      fetchAllCurriculumsSummary();
    }
  }, [token]);

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

  // 🛠️ NEW EXTENSION: Direct Matrix Card Delete Engine
  const deleteSubjectDirectly = async (classLevel: string, department: string, subjectToDelete: string) => {
    const activeToken = token || localStorage.getItem('bss_token');
    if (!activeToken || activeToken === 'null') return toast.error("Session expired.");

    const targetedConfig = allCurriculums.find(c => c.classLevel === classLevel && c.department === department);
    if (!targetedConfig) return;

    const remainingSubjects = targetedConfig.subjects.filter(s => s !== subjectToDelete);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/subjects`,
        {
          classLevel,
          department,
          subjects: remainingSubjects         
        },
        { headers: { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' } }
      );

      toast.success(`Removed ${subjectToDelete} from ${classLevel}`);
      
      if (selectedClass === classLevel && selectedDept === department) {
        setSubjects(remainingSubjects);
      }
      
      fetchAllCurriculumsSummary();
    } catch (err) {
      toast.error("Failed to update layout choice mapping.");
    }
  };

  const saveConfiguration = async () => {
    const activeToken = token || localStorage.getItem('bss_token');
    
    if (!activeToken || activeToken === 'null') {
      return toast.error("Authentication session missing. Please log in again.");
    }

    const correctDepartment = selectedClass.startsWith('JSS') 
      ? 'General' 
      : (selectedDept === 'General' ? 'Science' : selectedDept);

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/subjects`,
        {
          classLevel: selectedClass,
          department: correctDepartment,
          subjects: subjects         
        },
        { headers: { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' } }
      );

      toast.success(`${selectedClass} (${correctDepartment}) CURRICULUM UPDATED`, {
        duration: 3000,
        position: 'top-center',
        style: { background: '#059669', color: '#fff', fontWeight: '800' }
      });

      await fetchAllCurriculumsSummary();
      await fetchCurrentSubjects(selectedClass, correctDepartment);
    } catch (error: any) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update curriculum.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      <Toaster />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-primary/10 rounded-xl">
             <BookCheck className="text-primary" size={28} />
           </div>
           <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tight">Curriculum Management</h1>
        </div>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          Editing Workspace: <span className="text-primary">{selectedClass}</span> <span className="mx-2 text-gray-200">|</span> {selectedClass.startsWith('JSS') ? 'General' : selectedDept}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* PANEL: SELECTION */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
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
                value={selectedClass.startsWith('JSS') ? 'General' : (selectedDept === 'General' ? 'Science' : selectedDept)}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={isJuniorClass}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none appearance-none disabled:text-gray-400 disabled:cursor-not-allowed uppercase"
              >
                {departmentsAvailable.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Layers size={16} className="text-gray-400" />
              </div>
            </div>
            {isJuniorClass && (
              <p className="text-[10px] text-gray-400 mt-2 font-medium italic">* Junior classes are locked explicitly to General subjects.</p>
            )}
          </div>
        </div>

        {/* PANEL: SUBJECT LIST EDITOR */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
            <h3 className="font-black text-lg text-gray-800 uppercase flex items-center gap-2">
               <BookOpen size={20} className="text-primary" />
               Current Subjects Allocation
            </h3>
            {fetching && <Loader2 size={20} className="animate-spin text-primary" />}
          </div>

          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Enter subject name (e.g. Mathematics)..."
              className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:border-primary/20 focus:bg-white transition-all outline-none"
            />
            <button 
              onClick={handleAddSubject}
              className="bg-gray-900 text-white px-6 rounded-2xl hover:bg-primary transition-all shadow-lg"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 flex-1 content-start">
            {fetching ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                 <Loader2 size={32} className="animate-spin text-primary/30" />
              </div>
            ) : subjects.length > 0 ? (
              subjects.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-primary/20 hover:bg-white transition-all">
                  <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{sub}</span>
                  <button 
                    onClick={() => removeSubject(index)}
                    className="text-gray-300 hover:text-red-500 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider text-center">No subjects mapped yet.</p>
              </div>
            )}
          </div>

          <button 
            onClick={saveConfiguration}
            disabled={loading || fetching}
            className="w-full py-5 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-widest text-xs shadow-xl shadow-primary/10"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? 'Saving to Database...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* MATRIX LIVE OVERVIEW */}
      <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
          <h2 className="font-black text-xl text-gray-900 uppercase flex items-center gap-2 tracking-tight">
            <ClipboardList size={22} className="text-primary" />
            Live Curriculum Matrix Maps
          </h2>
          {fetchingSummary && <Loader2 size={18} className="animate-spin text-primary" />}
        </div>

        {allCurriculums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCurriculums.map((curriculum, idx) => (
              <div key={idx} className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-black text-gray-900 bg-white px-3 py-1 rounded-xl border border-gray-100">{curriculum.classLevel}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider ${
                      curriculum.department === 'Science' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      curriculum.department === 'Arts' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {curriculum.department}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-4 max-h-40 overflow-y-auto">
                    {curriculum.subjects.length > 0 ? (
                      curriculum.subjects.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1 text-[11px] font-bold bg-white text-gray-600 pl-2.5 pr-1.5 py-1 rounded-lg border border-gray-100 uppercase group/chip hover:border-red-200 hover:bg-red-50/20 transition-all">
                          <span>{s}</span>
                          <button
                            onClick={() => deleteSubjectDirectly(curriculum.classLevel, curriculum.department, s)}
                            className="text-gray-300 hover:text-red-500 p-0.5 rounded transition-colors"
                            title={`Delete ${s}`}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 italic uppercase tracking-wider py-1">No subjects assigned</span>
                    )}
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
                    className="text-[11px] font-extrabold text-primary hover:underline uppercase"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-100 rounded-3xl bg-gray-50/20">
            <p className="text-gray-400 font-bold text-xs uppercase">No configurations stored inside database.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SubjectManagement;