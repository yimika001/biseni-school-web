import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Briefcase, Trash2, X, ChevronLeft, ChevronRight, BookOpen, AlertCircle, CheckCircle, Pencil, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

interface Allocation {
  subjectName: string;
  classLevel: string;
  department: 'General' | 'Science' | 'Art';
}

interface Subject {
  _id: string;
  name: string;
  department: 'General' | 'Science' | 'Art';
}

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  subjects: string[];
  allocations: Allocation[];
  qualification: string;
  status: 'Active' | 'On Leave';
  staffId: string;
}

interface NewStaff {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: 'General' | 'Science' | 'Art';
  qualification: string;
  joinDate: string;
}

const DEPT_CLASSES: Record<string, string[]> = {
  General: ['JSS1', 'JSS2', 'JSS3'],
  Science:  ['SS1 Science', 'SS2 Science', 'SS3 Science'],
  Art:       ['SS1 Art', 'SS2 Art', 'SS3 Art'],
};

const DEPARTMENTS = ['General', 'Science', 'Art'] as const;

const AllocationRows = ({
  list, dept, setter, handleAllocationChange, handleRemoveAllocationRow, handleAddAllocationRow, availableSubjects
}: { 
  list: Allocation[]; 
  dept: 'General' | 'Science' | 'Art'; 
  setter: (v: Allocation[]) => void;
  handleAllocationChange: any;
  handleRemoveAllocationRow: any;
  handleAddAllocationRow: any;
  availableSubjects: Subject[];
}) => (
  <div className="space-y-2">
    {list.map((alloc, idx) => (
      <div key={idx} className="flex gap-2 items-start">
        <select
          value={alloc.subjectName}
          onChange={e => handleAllocationChange(list, idx, 'subjectName', e.target.value, setter, dept)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
        >
          <option value="">Select Subject</option>
          {availableSubjects.filter(s => s.department === dept).map(sub => (
            <option key={sub._id} value={sub.name}>{sub.name}</option>
          ))}
        </select>
        <select
          value={alloc.classLevel}
          onChange={e => handleAllocationChange(list, idx, 'classLevel', e.target.value, setter, dept)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
        >
          {DEPT_CLASSES[dept]?.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="button"
          onClick={() => handleRemoveAllocationRow(list, idx, setter)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Minus size={14} />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => handleAddAllocationRow(list, dept, setter)}
      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors py-1"
    >
      <Plus size={13} /> Add another allocation
    </button>
  </div>
);

const Staff = () => {
  const { token } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [totalStaffCount, setTotalStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ name: string; email: string; defaultPassword: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAllocations, setEditAllocations] = useState<Allocation[]>([]);
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState<'General' | 'Science' | 'Art'>('General');
  const [editQual, setEditQual] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'On Leave'>('Active');
  const [saving, setSaving] = useState(false);

  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [form, setForm] = useState<NewStaff>({
    name: '', email: '', phone: '', role: '', department: 'General', qualification: '', joinDate: '',
  });
  const [addAllocations, setAddAllocations] = useState<Allocation[]>([{ subjectName: '', classLevel: 'JSS1', department: 'General' }]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(false);
      const [staffRes, subRes] = await Promise.all([
        axios.get(API_ENDPOINTS.STAFF.LIST, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_ENDPOINTS.SUBJECTS.LIST, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStaff(staffRes.data.staff || []);
      setTotalStaffCount(staffRes.data.totalGlobal || 0);
      setSubjects(subRes.data || []);
    } catch { 
      setError(true);
      addToast('Failed to load data.', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [token]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  useEffect(() => {
    setAddAllocations(prev => prev.map(a => ({
      ...a,
      department: form.department,
      subjectName: '',
      classLevel: DEPT_CLASSES[form.department][0],
    })));
  }, [form.department]);

  const handleAddAllocationRow = (list: Allocation[], dept: 'General' | 'Science' | 'Art', setter: (v: Allocation[]) => void) => {
    setter([...list, { subjectName: '', classLevel: DEPT_CLASSES[dept][0], department: dept }]);
  };

  const handleRemoveAllocationRow = (list: Allocation[], idx: number, setter: (v: Allocation[]) => void) => {
    setter(list.filter((_, i) => i !== idx));
  };

  const handleAllocationChange = (
    list: Allocation[], idx: number, field: keyof Allocation, value: string,
    setter: (v: Allocation[]) => void, dept: 'General' | 'Science' | 'Art'
  ) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'department') {
      updated[idx].classLevel = DEPT_CLASSES[value as keyof typeof DEPT_CLASSES][0];
    }
    setter(updated);
  };

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.role || !form.department) {
      addToast('Please fill in all required fields.', 'error'); return;
    }
    const validAllocs = addAllocations.filter(a => a.subjectName.trim());
    try {
      setSubmitting(true);
      const res = await axios.post(
        API_ENDPOINTS.STAFF.CREATE,
        { ...form, allocations: validAllocs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCredentials({ name: form.name, email: form.email, defaultPassword: res.data.credentials.defaultPassword });
      setShowModal(false);
      setShowSuccessModal(true);
      fetchData();
      setForm({ name: '', email: '', phone: '', role: '', department: 'General', qualification: '', joinDate: '' });
      setAddAllocations([{ subjectName: '', classLevel: 'JSS1', department: 'General' }]);
    } catch { addToast('Failed to add staff member.', 'error'); } finally { setSubmitting(false); }
  };

  const initiateEditRequest = (member: StaffMember) => {
    setStaffToEdit(member);
    setEditRole(member.role);
    setEditDept((member.department as 'General' | 'Science' | 'Art') || 'General');
    setEditQual(member.qualification || '');
    setEditStatus(member.status);
    setEditAllocations(
      member.allocations?.length
        ? member.allocations
        : [{ subjectName: '', classLevel: DEPT_CLASSES[member.department]?.[0] || 'JSS1', department: (member.department as 'General' | 'Science' | 'Art') || 'General' }]
    );
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!staffToEdit || !editRole.trim()) { addToast('Role is required.', 'error'); return; }
    const validAllocs = editAllocations.filter(a => a.subjectName.trim());
    try {
      setSaving(true);
      await axios.put(
        API_ENDPOINTS.STAFF.DETAILS(staffToEdit._id),
        { role: editRole.trim(), department: editDept, allocations: validAllocs, qualification: editQual.trim(), status: editStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Staff record updated successfully.', 'success');
      setShowEditModal(false); setStaffToEdit(null);
      fetchData();
    } catch { addToast('Failed to update staff record.', 'error'); } finally { setSaving(false); }
  };

  const initiateDeleteRequest = (member: StaffMember) => {
    setStaffToDelete(member); setDeleteConfirmed(false); setShowDeleteModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!staffToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(API_ENDPOINTS.STAFF.DELETE(staffToDelete._id), { headers: { Authorization: `Bearer ${token}` } });
      addToast('Staff member deleted successfully.', 'success');
      setShowDeleteModal(false); setStaffToDelete(null);
      fetchData();
    } catch { addToast('Failed to delete staff member.', 'error'); } finally { setDeleting(false); setDeleteConfirmed(false); }
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8">
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-bold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        ))}
      </div>

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
          <input type="text" placeholder="Search by name, email or department..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading staff records...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 font-bold">Failed to load staff data. Please try again later.</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No staff found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map(member => (
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
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen size={12} /> Allocations</p>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {member.allocations?.length > 0
                        ? member.allocations.map((a, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
                            {a.subjectName} · {a.classLevel}
                          </span>
                        ))
                        : member.subjects?.length > 0
                          ? member.subjects.map((s, i) => <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{s}</span>)
                          : <span className="text-xs text-gray-400 italic">No allocations assigned</span>
                      }
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <button onClick={() => initiateEditRequest(member)} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 border border-primary/20 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors text-gray-500">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => initiateDeleteRequest(member)} className="flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 border border-red-100 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500">
                    <Trash2 size={14} /> Remove
                  </button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Add Staff</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'e.g. Dr. Benson Amaka' },
                { label: 'Email Address *', key: 'email', placeholder: 'e.g. b.amaka@biseni.edu.ng' },
                { label: 'Role *', key: 'role', placeholder: 'e.g. Secondary Teacher' },
                { label: 'Qualification', key: 'qualification', placeholder: 'e.g. B.Ed Mathematics' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{field.label}</label>
                  <input type="text" value={form[field.key as keyof NewStaff]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Department *</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value as 'General' | 'Science' | 'Art' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Subject Allocations</label>
                <AllocationRows 
                    list={addAllocations} 
                    dept={form.department} 
                    setter={setAddAllocations} 
                    handleAllocationChange={handleAllocationChange}
                    handleRemoveAllocationRow={handleRemoveAllocationRow}
                    handleAddAllocationRow={handleAddAllocationRow}
                    availableSubjects={subjects}
                />
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddStaff} disabled={submitting} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark disabled:opacity-50">{submitting ? 'Adding...' : 'Add Staff'}</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <h2 className="text-lg font-black text-gray-900 mb-2">Staff Added Successfully!</h2>
            {newCredentials && (
              <div className="bg-gray-50 p-4 rounded-lg my-4 text-left text-sm space-y-1">
                <p><strong>Name:</strong> {newCredentials.name}</p>
                <p><strong>Email:</strong> {newCredentials.email}</p>
                <p><strong>Default Password:</strong> {newCredentials.defaultPassword}</p>
              </div>
            )}
            <button onClick={() => { setShowSuccessModal(false); setNewCredentials(null); }} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark">Done</button>
          </div>
        </div>
      )}

      {showEditModal && staffToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Edit Staff Record</h3>
              <button onClick={() => { setShowEditModal(false); setStaffToEdit(null); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-all"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Staff Member</p>
                <p className="text-sm font-extrabold text-gray-900">{staffToEdit.name}</p>
                <p className="text-xs text-gray-500">{staffToEdit.email}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Role / Position *</label>
                <input type="text" value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="e.g. Secondary Teacher" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Department *</label>
                <select value={editDept} onChange={e => {
                  const d = e.target.value as 'General' | 'Science' | 'Art';
                  setEditDept(d);
                  setEditAllocations([{ subjectName: '', classLevel: DEPT_CLASSES[d][0], department: d }]);
                }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Subject Allocations</label>
                <AllocationRows 
                    list={editAllocations} 
                    dept={editDept} 
                    setter={setEditAllocations}
                    handleAllocationChange={handleAllocationChange}
                    handleRemoveAllocationRow={handleRemoveAllocationRow}
                    handleAddAllocationRow={handleAddAllocationRow}
                    availableSubjects={subjects}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Qualification</label>
                <input type="text" value={editQual} onChange={e => setEditQual(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" placeholder="e.g. B.Ed Mathematics, PGDE" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as 'Active' | 'On Leave')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white">
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
              <button type="button" disabled={saving} onClick={() => { setShowEditModal(false); setStaffToEdit(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50">Cancel</button>
              <button type="button" disabled={saving} onClick={handleSaveEdit} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && staffToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Delete Staff Record</h3>
              <button onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); setDeleteConfirmed(false); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-all"><X size={16} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</span><span className="text-sm font-extrabold text-gray-900">{staffToDelete.name}</span></div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Staff ID</span><span className="text-sm font-bold text-gray-700">{staffToDelete.staffId || '—'}</span></div>
                  <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Department</span><span className="text-sm font-bold text-gray-700">{staffToDelete.department}</span></div>
                  <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Role</span><span className="text-sm font-bold text-gray-700">{staffToDelete.role}</span></div>
                  <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email</span><span className="text-sm font-bold text-gray-700 truncate block">{staffToDelete.email}</span></div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium leading-relaxed"><span className="font-black">Warning:</span> This will permanently delete the staff member's record and revoke all login access. This action cannot be undone.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={deleteConfirmed} onChange={e => setDeleteConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-red-600 cursor-pointer shrink-0" />
                <span className="text-xs text-gray-600 font-medium leading-relaxed">I understand I am permanently deleting the record of this staff member. This action cannot be undone.</span>
              </label>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
              <button type="button" disabled={deleting} onClick={() => { setShowDeleteModal(false); setStaffToDelete(null); setDeleteConfirmed(false); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50">Cancel</button>
              <button type="button" disabled={!deleteConfirmed || deleting} onClick={handleConfirmedDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{deleting ? 'Deleting...' : 'Confirm Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;