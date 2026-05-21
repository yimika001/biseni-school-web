import { useState, useEffect } from 'react';
import { Search, UserPlus, X, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  department: string;
  gender: string;
  feesStatus: 'Paid' | 'Pending' | 'Part-Payment';
  parentContact?: string;
  admissionYear: string;
}

interface NewStudent {
  firstName: string;
  lastName: string;
  gender: string;
  class: string;
  department: string;
  parentContact: string;
  admissionYear: string;
}

const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
const departments = ['JSS', 'Sciences', 'Arts', 'Commercial', 'Vocational'];

const Students = () => {
  // Pull context with a programmatic local fallback to guard against string serialization drops
  const { token: contextToken } = useAuth();
  const activeToken = contextToken || localStorage.getItem('bss_token');

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [newCredentials, setNewCredentials] = useState<{ admissionNumber: string; defaultPassword: string } | null>(null);

  const [form, setForm] = useState<NewStudent>({
    firstName: '',
    lastName: '',
    gender: 'Male',
    class: 'JSS1',
    department: 'JSS',
    parentContact: '',
    admissionYear: new Date().getFullYear().toString(),
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterClass) params.class = filterClass;

      if (!activeToken) {
        console.error("Authentication missing: No active token found in context or localStorage.");
        return;
      }

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
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, filterClass]);

  const handleAddStudent = async () => {
    if (!form.firstName || !form.lastName || !form.class || !form.department) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/students/register`,
        form,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      setSuccessMsg(`Student registered successfully!`);
      fetchStudents();
      setForm({
        firstName: '',
        lastName: '',
        gender: 'Male',
        class: 'JSS1',
        department: 'JSS',
        parentContact: '',
        admissionYear: new Date().getFullYear().toString(),
      });
    } catch (error) {
      alert('Failed to register student. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/students/${id}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      fetchStudents();
    } catch (error) {
      alert('Failed to delete student.');
    }
  };

  const handleFeesUpdate = async (id: string, feesStatus: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/students/${id}/fees`,
        { feesStatus },
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      fetchStudents();
    } catch (error) {
      alert('Failed to update fees status.');
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
    <div className="p-6 lg:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-500 text-sm">{students.length} students registered</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSuccessMsg(''); setNewCredentials(null); }}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
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
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium bg-white outline-none focus:border-primary"
        >
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admission No.</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fees Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Querying school database...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
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
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-gray-400">{student.gender} · {student.department}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{student.admissionNumber}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={student.feesStatus}
                        onChange={(e) => handleFeesUpdate(student._id, e.target.value)}
                        className={`px-3 py-1 border rounded-full text-[10px] uppercase font-bold outline-none cursor-pointer ${getStatusStyle(student.feesStatus)}`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Part-Payment">Part-Payment</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Register New Student</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-bold text-sm mb-2">{successMsg}</p>
                  {newCredentials && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-green-600">Admission Number: <span className="font-black">{newCredentials.admissionNumber}</span></p>
                      <p className="text-xs font-bold text-green-600">Default Password: <span className="font-black">{newCredentials.defaultPassword}</span></p>
                      <p className="text-[10px] text-green-500 mt-2">Share these credentials with the student.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="e.g. Amaka"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="e.g. Jonah"
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
    </div>
  );
};

export default Students;