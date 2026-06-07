import { useState, useEffect } from 'react';
import { Search, UserPlus, X, Trash2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  admissionNumber: string;
  surname: string;        
  firstName: string;
  middleName?: string;   
  class: string;
  department: string;
  gender: string;
  feesStatus: 'Paid' | 'Pending' | 'Part-Payment';
  parentContact?: string;
  admissionYear: string;
}

interface NewStudent {
  surname: string;        
  firstName: string;
  middleName: string;    
  gender: string;
  class: string;
  department: string;
  parentContact: string;
  admissionYear: string;
}

const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
const departments = ['General', 'Science', 'Art'];

const Students = () => {
  const { token: contextToken } = useAuth();
  const activeToken = contextToken || localStorage.getItem('bss_token');

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [newCredentials, setNewCredentials] = useState<{ name: string; admissionNumber: string; defaultPassword: string } | null>(null);
  
  // Toast Notification State
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  // 🛠️ PAGINATION STATE CONFIGURATIONS
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const limitSetting = 20;

  // 🛠️ DELETE MODAL STATE CONFIGURATIONS
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const [form, setForm] = useState<NewStudent>({
    surname: '',        
    firstName: '',
    middleName: '',    
    gender: 'Male',
    class: 'JSS1',
    department: 'General', 
    parentContact: '',
    admissionYear: new Date().getFullYear().toString(),
  });

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const formatToUpperCase = (val: string) => val.toUpperCase();
  const formatToTitleCase = (val: string) => {
    return val
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterClass]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page,
        limit: limitSetting
      };
      if (searchTerm) params.search = searchTerm;
      if (filterClass) params.class = filterClass;

      if (!activeToken) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/students`,
        { 
          headers: { 
            Authorization: `Bearer ${activeToken}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }, 
          params 
        }
      );
      
      setStudents(response.data.students || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalFilteredRecords(response.data.totalFiltered || response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, searchTerm, filterClass]);

  const handleAddStudent = async () => {
    if (!form.surname.trim() || !form.firstName.trim() || !form.class || !form.department) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      setNewCredentials(null);
      setSuccessMsg('');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/students/register`,
        form,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );

      const registeredName = form.middleName.trim()
        ? `${form.surname.trim().toUpperCase()}, ${form.firstName.trim()} ${form.middleName.trim()}`
        : `${form.surname.trim().toUpperCase()}, ${form.firstName.trim()}`;

      if (response.data && response.data.credentials) {
        setNewCredentials({
          name: registeredName,
          admissionNumber: response.data.credentials.admissionNumber,
          defaultPassword: response.data.credentials.defaultPassword,
        });
      }

      setSuccessMsg(`Student registered successfully!`);
      addToast('Student registered successfully!', 'success');
      setShowModal(false); 
      setShowSuccessModal(true); 
      fetchStudents();
      
      setForm({
        surname: '',
        firstName: '',
        middleName: '',
        gender: 'Male',
        class: 'JSS1',
        department: 'General', 
        parentContact: '',
        admissionYear: new Date().getFullYear().toString(),
      });
    } catch (error) {
      addToast('Failed to register student.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const initiateDeleteRequest = (student: Student) => {
    setStudentToDelete(student);
    setDeleteConfirmed(false);
    setShowDeleteModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleting(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/students/${studentToDelete._id}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      
      addToast('Student deleted successfully.', 'success');
      
      if (students.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchStudents();
      }
      
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      addToast('Failed to delete student.', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirmed(false);
    }
  };

  const handleFeesUpdate = async (id: string, feesStatus: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/students/${id}/fees`,
        { feesStatus },
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      addToast('Fees status updated.', 'success');
      fetchStudents();
    } catch (error) {
      addToast('Failed to update fees status.', 'error');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-red-100 text-red-700 border-red-200';
      case 'Part-Payment': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-bold animate-in slide-in-from-right-5 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 text-sm font-medium">
            {searchTerm || filterClass ? (
              <>
                Showing <span className="text-primary font-bold">{totalFilteredRecords}</span> {totalFilteredRecords === 1 ? 'record' : 'records'} matching your filters
              </>
            ) : (
              <>
                Showing <span className="text-gray-900 font-bold">{totalFilteredRecords}</span> registered students total
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSuccessMsg(''); setNewCredentials(null); }}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 text-sm md:text-base"
        >
          <UserPlus size={18} /> Add New Student
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or admission number..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium bg-white outline-none focus:border-primary text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 md:rounded-xl shadow-sm overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admission No.</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fees Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="block md:table-row-group divide-y divide-gray-100">
              {loading ? (
                <tr className="block md:table-row">
                  <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest block md:table-cell">
                    Querying school database...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan={5} className="px-6 py-12 block md:table-cell">
                    <div className="max-w-sm mx-auto p-4 text-center border border-dashed border-amber-200 rounded-xl bg-amber-50/40">
                      <AlertCircle className="mx-auto text-amber-500 mb-2" size={22} />
                      <p className="text-xs font-black text-amber-900 uppercase tracking-tight">
                        No Student Matches
                      </p>
                      <p className="text-[11px] text-amber-600 font-medium mt-1">
                        {searchTerm 
                          ? `No student record for "${searchTerm}" was identified in this class tier.` 
                          : "No students are currently configured inside this system environment."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr 
                    key={student._id} 
                    className="block md:table-row hover:bg-gray-50/50 transition-colors p-4 md:p-0 border-b border-gray-100 last:border-0 md:border-b-0"
                  >
                    <td className="block md:table-cell md:px-6 md:py-4 pb-3">
                      <div className="flex justify-between items-start md:block">
                        <div>
                          <div className="font-bold text-gray-900 text-sm md:text-base">
                            {student.surname?.toUpperCase()}, {student.firstName} {student.middleName || ''}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 md:mt-0">
                            {student.gender} · {student.department}
                          </div>
                        </div>
                        <span className="md:hidden px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">
                          {student.class}
                        </span>
                      </div>
                    </td>

                    <td className="block md:table-cell md:px-6 md:py-4 py-2 border-t border-dashed border-gray-100 md:border-none">
                      <div className="grid grid-cols-2 md:block gap-y-2">
                        <div className="md:hidden text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                          Admission No.
                        </div>
                        <div className="text-gray-700 md:text-gray-600 text-sm font-medium md:font-bold">
                          {student.admissionNumber}
                        </div>
                      </div>
                    </td>

                    <td className="hidden md:table-cell md:px-6 md:py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        {student.class}
                      </span>
                    </td>

                    <td className="block md:table-cell md:px-6 md:py-4 py-2">
                      <div className="grid grid-cols-2 md:block items-center">
                        <div className="md:hidden text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Fees Status
                        </div>
                        <div>
                          <select
                            value={student.feesStatus}
                            onChange={(e) => handleFeesUpdate(student._id, e.target.value)}
                            className={`px-3 py-1 border rounded-full text-[10px] uppercase font-bold outline-none cursor-pointer w-fit ${getStatusStyle(student.feesStatus)}`}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Part-Payment">Part-Payment</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    <td className="block md:table-cell md:px-6 md:py-4 pt-3 md:text-right border-t border-dashed border-gray-100 md:border-none">
                      <div className="flex justify-between md:justify-end items-center">
                        <div className="md:hidden text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Actions Management
                        </div>
                        <button
                          onClick={() => initiateDeleteRequest(student)}
                          className="p-2 md:hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all flex items-center justify-center bg-gray-50 md:bg-transparent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ STYLIZED PAGINATION NAVIGATION INTERFACE FOOTER */}
        {!loading && students.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center sm:text-left">
              Page <span className="text-gray-900 font-extrabold">{page}</span> of{' '}
              <span className="text-gray-900 font-extrabold">{totalPages}</span>
              {totalFilteredRecords > 0 && (
                <span className="font-medium text-gray-400 lowercase tracking-normal block sm:inline sm:ml-1.5">
                  ({totalFilteredRecords} total matches)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all select-none flex-1 sm:flex-initial"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 bg-white rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all select-none flex-1 sm:flex-initial"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl transition-all">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Register New Student</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Surname *</label>
                  <input
                    type="text"
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: formatToUpperCase(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="e.g. VICTOR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: formatToTitleCase(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="e.g. Oluwayimika"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={(e) => setForm({ ...form, middleName: formatToTitleCase(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="e.g. Precious"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Class *</label>
                  <select
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
                  >
                    {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
                >
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Parent Contact</label>
                <input
                  type="text"
                  value={form.parentContact}
                  onChange={(e) => setForm({ ...form, parentContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="e.g. +234 801 234 5678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Admission Year *</label>
                <input
                  type="text"
                  value={form.admissionYear}
                  onChange={(e) => setForm({ ...form, admissionYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="e.g. 2026"
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={submitting}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {submitting ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS & CREDENTIAL CONFIRMATION MODAL OVERLAY */}
      {showSuccessModal && newCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-all border border-gray-100">
            <div className="p-6 text-center border-b border-gray-50">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">
                Registration Complete
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Student has been fully configured inside the system portal.
              </p>
            </div>

            <div className="p-6 bg-gray-50/50 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered Full Name</span>
                  <span className="text-base font-extrabold text-gray-900 tracking-wide select-all">{newCredentials.name}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admission Number</span>
                  <span className="text-sm font-black text-gray-700 tracking-wide select-all">{newCredentials.admissionNumber}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Access Password</span>
                  <span className="text-sm font-black text-primary tracking-wide select-all">{newCredentials.defaultPassword}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 px-1">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Make sure to copy these details before confirming. Share them securely with the student.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-t flex gap-3">
              <button
                type="button"
                onClick={() => { setShowSuccessModal(false); setNewCredentials(null); }}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all text-center shadow-md shadow-primary/10"
              >
                Confirm Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APP-STYLE DELETE CONFIRMATION OVERLAY MODAL */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform scale-100 transition-all">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                Delete Student Record
              </h3>
              <button
                onClick={() => { setShowDeleteModal(false); setStudentToDelete(null); setDeleteConfirmed(false); }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</span>
                  <span className="text-sm font-extrabold text-gray-900">
                    {studentToDelete.surname?.toUpperCase()}, {studentToDelete.firstName} {studentToDelete.middleName || ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reg. Number</span>
                    <span className="text-sm font-bold text-gray-700">{studentToDelete.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Class</span>
                    <span className="text-sm font-bold text-gray-700">{studentToDelete.class}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Department</span>
                    <span className="text-sm font-bold text-gray-700">{studentToDelete.department}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium leading-relaxed">
                  <span className="font-black">Warning:</span> You are about to permanently delete this student's record from the school portal. This action cannot be undone. Once deleted, the student will no longer be able to log in using their existing credentials.
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 accent-red-600 cursor-pointer shrink-0"
                />
                <span className="text-xs text-gray-600 font-medium leading-relaxed group-hover:text-gray-800 transition-colors">
                  I understand that I am permanently deleting the record of this student. This action cannot be undone.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
              <button
                type="button"
                disabled={deleting}
                onClick={() => { setShowDeleteModal(false); setStudentToDelete(null); setDeleteConfirmed(false); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteConfirmed || deleting}
                onClick={handleConfirmedDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;