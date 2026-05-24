import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Briefcase, Trash2, X } from 'lucide-react';
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

const departments = ['Sciences', 'Arts', 'Commercial', 'Vocational', 'Administration'];

const Staff = () => {
  const { token } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [newCredentials, setNewCredentials] = useState<{ email: string; defaultPassword: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState<NewStaff>({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Sciences',
    subjects: '',
    qualification: '',
    joinDate: '',
  });

  const fetchStaff = async () => {
    if (!token) return; // Prevent making requests without a token
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/staff`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStaff(response.data.staff);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run whenever the token changes or updates
  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSuccessMsg('');
    setNewCredentials(null);
  };

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.role || !form.department) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/staff/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCredentials(response.data.credentials);
      setSuccessMsg('Staff member added successfully!');
      fetchStaff();
      setForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: 'Sciences',
        subjects: '',
        qualification: '',
        joinDate: '',
      });
    } catch (error) {
      alert('Failed to add staff member. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/staff/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStaff();
    } catch (error) {
      alert('Failed to delete staff member.');
    }
  };

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Staff Directory</h1>
          <p className="text-gray-500 text-sm">{staff.length} staff members registered</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSuccessMsg(''); setNewCredentials(null); }}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <UserPlus size={18} /> Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or department..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading staff...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((member) => (
            <div key={member._id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase ${
                member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {member.status}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-primary font-semibold uppercase">{member.role}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{member.staffId}</p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Briefcase size={16} className="text-gray-400 shrink-0" />
                  <span>{member.department} Department</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.subjects.map((s) => (
                      <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleDelete(member._id)}
                  className="flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 border border-red-100 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-500"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Add Staff Member</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-bold text-sm mb-2">{successMsg}</p>
                  {newCredentials && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-green-600">Email: <span className="font-black">{newCredentials.email}</span></p>
                      <p className="text-xs font-bold text-green-600">Default Password: <span className="font-black">{newCredentials.defaultPassword}</span></p>
                      <p className="text-[10px] text-green-500 mt-2">Share these credentials with the staff member.</p>
                    </div>
                  )}
                </div>
              )}

              {[
                { label: 'Full Name *', key: 'name', placeholder: 'e.g. Dr. Benson Amaka' },
                { label: 'Email Address *', key: 'email', placeholder: 'e.g. b.amaka@biseni.edu.ng' },
                { label: 'Phone Number', key: 'phone', placeholder: 'e.g. +234 801 234 5678' },
                { label: 'Role *', key: 'role', placeholder: 'e.g. HOD Science, Class Teacher' },
                { label: 'Qualification', key: 'qualification', placeholder: 'e.g. B.Sc. Education, M.Ed' },
                { label: 'Join Date', key: 'joinDate', placeholder: 'e.g. 2024' },
                { label: 'Subjects (comma separated)', key: 'subjects', placeholder: 'e.g. Physics, Further Maths' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={form[field.key as keyof NewStaff]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

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
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={submitting}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;