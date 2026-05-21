import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Calendar, Tag, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Event';
  date: string;
  isPublished: boolean;
  createdBy: {
    name: string;
    email: string;
  };
}

const categoryColors: Record<string, string> = {
  General: 'bg-blue-50 text-blue-600 border-blue-200',
  Academic: 'bg-green-50 text-green-600 border-green-200',
  Holiday: 'bg-orange-50 text-orange-600 border-orange-200',
  Event: 'bg-purple-50 text-purple-600 border-purple-200',
};

const Announcements = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.date) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/announcements`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg('Announcement posted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setForm({
        title: '',
        content: '',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
      });
      fetchAnnouncements();
    } catch (error) {
      alert('Failed to post announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/announcements/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnnouncements();
    } catch (error) {
      alert('Failed to delete announcement.');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/announcements/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnnouncements();
    } catch (error) {
      alert('Failed to toggle announcement.');
    }
  };

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Announcements Manager</h1>
          <p className="text-gray-500 text-sm">Create and manage news updates for the school community.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-primary" /> New Announcement
            </h2>

            {successMsg && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 font-bold text-sm">{successMsg}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-primary text-sm"
                  placeholder="e.g. Mid-Term Break Notice"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-primary text-sm"
                >
                  <option>General</option>
                  <option>Academic</option>
                  <option>Holiday</option>
                  <option>Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content *</label>
                <textarea
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-3 bg-gray-50 border rounded-lg outline-none focus:border-primary text-sm resize-none"
                  placeholder="Write the details here..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Megaphone size={20} className="text-accent" />
            All Announcements ({announcements.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">No announcements yet. Create one!</p>
            </div>
          ) : (
            announcements.map((item) => (
              <div
                key={item._id}
                className={`bg-white border rounded-xl p-5 transition-all ${
                  item.isPublished ? 'border-gray-100 hover:border-primary/30' : 'border-dashed border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 items-start flex-1">
                    <div className="bg-green-50 p-3 rounded-full text-primary shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        {!item.isPublished && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full uppercase">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 leading-relaxed">{item.content}</p>
                      <div className="flex gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[item.category]}`}>
                          <Tag size={10} /> {item.category}
                        </span>
                        <span className="text-xs text-gray-400">{item.date}</span>
                        <span className="text-xs text-gray-400">by {item.createdBy?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(item._id)}
                      className={`p-2 rounded-lg transition-all text-xs font-bold flex items-center gap-1 ${
                        item.isPublished
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.isPublished ? 'Hide' : 'Publish'}
                    >
                      {item.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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