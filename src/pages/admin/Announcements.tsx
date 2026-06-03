import { useState, useEffect } from 'react';
import { Trash2, Edit2, Search, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Event';
  isPublished: boolean;
}

const Announcements = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', isPublished: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/announcements`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setAnnouncements(res.data.announcements || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchAnnouncements(); }, [token]);

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
    } catch (err) { alert('Action failed'); }
    setIsPosting(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/announcements/${deleteModal.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setDeleteModal({ isOpen: false, id: null });
      fetchAnnouncements();
    } catch (err) { alert('Delete failed'); }
  };

  return (
    <div className="p-6">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
            <p className="font-bold text-lg">Action Successful!</p>
          </div>
        </div>
      )}

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
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditId(null); }} className="bg-primary text-white px-3 py-1.5 text-sm rounded-lg">
          {isFormOpen ? 'Close' : 'New Post'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white border rounded-xl p-6 mb-8 space-y-4">
          <h2 className="font-bold">{editId ? 'Edit Announcement' : 'Post New'}</h2>
          <input className="w-full p-2 border rounded" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea className="w-full p-2 border rounded" placeholder="Content" rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          <button onClick={handleSubmit} disabled={isPosting} className="w-full bg-primary text-white py-2 rounded flex justify-center items-center gap-2">
            {isPosting ? <Loader2 className="animate-spin" size={20} /> : (editId ? 'Update' : 'Post')}
          </button>
        </div>
      )}
    </div>
  );
};
export default Announcements;