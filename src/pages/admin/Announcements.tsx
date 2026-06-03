import { useState, useEffect } from 'react';
import { Trash2, Edit2, Search, Loader2, CheckCircle, LogOut } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Event';
  isPublished: boolean;
}

const Announcements = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', isPublished: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/portal');
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/announcements`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAnnouncements(res.data.announcements || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { if (token) fetchAnnouncements(); }, [token]);

  const filteredAnnouncements = announcements.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    setIsPosting(true);
    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/announcements/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/announcements`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setForm({ title: '', content: '', category: 'General', isPublished: false });
      setEditId(null);
      setIsFormOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchAnnouncements();
    } catch (err) { 
      alert('Action failed'); 
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    await axios.delete(`${import.meta.env.VITE_API_URL}/announcements/${deleteModal.id}`, { headers: { Authorization: `Bearer ${token}` } });
    setDeleteModal({ isOpen: false, id: null });
    fetchAnnouncements();
  };

  const startEdit = (item: Announcement) => {
    setForm({ title: item.title, content: item.content, category: item.category, isPublished: item.isPublished });
    setEditId(item._id);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 rounded-lg bg-gray-100">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-2 rounded-lg bg-red-600 text-white">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
            <p className="font-bold text-lg">Action Successful!</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Delete this announcement?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="flex-1 py-2 rounded-lg bg-gray-100">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => { setIsFormOpen(!isFormOpen); setEditId(null); }} 
            className="bg-primary text-white px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            {isFormOpen ? 'Close' : 'New Post'}
          </button>
          <button onClick={() => setShowLogoutModal(true)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {isFormOpen && (
          <div className="lg:col-span-1 bg-white border rounded-xl p-6 h-fit space-y-4">
            <h2 className="font-bold">{editId ? 'Edit Announcement' : 'Post New'}</h2>
            <input className="w-full p-2 border rounded" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <select className="w-full p-2 border rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
              <option>General</option><option>Academic</option><option>Holiday</option><option>Event</option>
            </select>
            <textarea className="w-full p-2 border rounded" placeholder="Content" rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} />
              Publish immediately
            </label>
            <button 
              onClick={handleSubmit} 
              disabled={isPosting}
              className="w-full bg-primary text-white py-2 rounded flex justify-center items-center gap-2"
            >
              {isPosting ? <Loader2 className="animate-spin" size={20} /> : (editId ? 'Update' : 'Post')}
            </button>
          </div>
        )}

        <div className={`space-y-4 ${isFormOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-xl" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            filteredAnnouncements.map((item) => (
              <div key={item._id} className="bg-white border rounded-xl p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.content}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="text-blue-600"><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteModal({ isOpen: true, id: item._id })} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default Announcements;