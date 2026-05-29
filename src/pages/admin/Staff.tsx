import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Briefcase, Trash2, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  subjects: string[];
  qualification: string;
  status: 'Active' | 'On Leave';
  staffId: string;
}

interface NewStaff {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  subjects: string;
  qualification: string;
  joinDate: string;
}

const SECONDARY_DEPARTMENTS = ['Sciences', 'Arts'];
const JUNIOR_DEPARTMENTS = ['General'];

const Staff = () => {
  const { token } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ name: string; email: string; defaultPassword: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [form, setForm] = useState<NewStaff>({
    name: '', email: '', phone: '', role: '', department: 'Sciences',
    subjects: '', qualification: '', joinDate: '',
  });

  const getAvailableDepartments = () => {
    const roleLower = form.role.toLowerCase();
    return roleLower.includes('junior') ? JUNIOR_DEPARTMENTS : SECONDARY_DEPARTMENTS;
  };

  useEffect(() => {
    const available = getAvailableDepartments();
    if (!available.includes(form.department)) {
      setForm(prev => ({ ...prev, department: available[0] }));
    }
  }, [form.role]);

  const fetchStaff = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff`, { headers: { Authorization: `Bearer ${token}` } });
      setStaff(response.data.staff);
      setTotalStaffCount(response.data.totalGlobal);
    } catch (error) { console.error('Failed to fetch staff:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, [token]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleCloseModal = () => {
    setShowModal(false);
    setShowSuccessModal(false);
    setNewCredentials(null);
  };

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.role || !form.department) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = { ...form, subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean) };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/staff/add`, payload, { headers: { Authorization: `Bearer ${token}` } });
      
      setNewCredentials({ name: form.name, ...response.data.credentials });
      setShowModal(false);
      setShowSuccessModal(true);
      fetchStaff();
      setForm({ name: '', email: '', phone: '', role: '', department: 'Sciences', subjects: '', qualification: '', joinDate: '' });
    } catch (error) { alert('Failed to add staff member.'); } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/staff/${deleteConfirmation.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDeleteConfirmation(null);
      fetchStaff();
    } catch (error) { alert('Failed to delete staff member.'); }
  };

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Staff Directory</h1>
          <p className="text-gray-500 text-sm">{totalStaffCount} staff members registered</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all">
          <UserPlus size={18} /> Add Staff
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input type="text" placeholder="Search by name, email or department..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No staff found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((member) => (
              <div key={member._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{member.status}</div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">{member.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-primary font-semibold uppercase">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600"><Briefcase size={16} className="text-gray-400 shrink-0" /> <span>{member.department} Department</span></div>
                  <div className="flex items-center gap-3 text-sm text-gray-600"><Mail size={16} className="text-gray-400 shrink-0" /> <span className="truncate">{member.email}</span></div>
                  
                  {/* Subjects Allocation Section */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen size={12} /> Subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.subjects.length > 0 ? member.subjects.map((subj, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{subj}</span>
                      )) : <span className="text-xs text-gray-400 italic">No subjects assigned</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button onClick={() => setDeleteConfirmation({ id: member._id, name: member.name })} className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 border border-red-100 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500"><Trash2 size={14} /> Remove</button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={20} /></button>
              <span className="text-sm font-bold text-gray-600">Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={20} /></button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Add Staff</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'e.g. Dr. Benson Amaka' },
                { label: 'Email Address *', key: 'email', placeholder: 'e.g. b.amaka@biseni.edu.ng' },
                { label: 'Role *', key: 'role', placeholder: 'e.g. Junior/Secondary Teacher' },
                { label: 'Subjects', key: 'subjects', placeholder: 'e.g. Physics, Math' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{field.label}</label>
                  <input type="text" value={form[field.key as keyof NewStaff]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Department *</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white">
                  {getAvailableDepartments().map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={handleCloseModal} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddStaff} disabled={submitting} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark">{submitting ? 'Adding...' : 'Add Staff'}</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <h2 className="text-lg font-black text-gray-900 mb-2">Staff Added Successfully!</h2>
            {newCredentials && (
              <div className="bg-gray-50 p-4 rounded-lg my-4 text-left text-sm">
                <p><strong>Name:</strong> {newCredentials.name}</p>
                <p><strong>Email:</strong> {newCredentials.email}</p>
                <p><strong>Default Password:</strong> {newCredentials.defaultPassword}</p>
              </div>
            )}
            <button onClick={handleCloseModal} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark">Done</button>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-black text-gray-900 mb-2">Confirm Removal</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <span className="font-bold text-gray-900">{deleteConfirmation.name}</span> from the staff directory? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmation(null)} className="flex-1 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;