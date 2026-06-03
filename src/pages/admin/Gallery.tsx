import { useState, useEffect } from 'react';
import { Trash2, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminGallery = () => {
  const { token } = useAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fetchImages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/gallery`);
      setImages(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    setUploading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/gallery`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchImages();
    } catch (err) { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/gallery/${deleteConfirm._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteConfirm(null);
      fetchImages();
    } catch (err) { alert('Delete failed'); }
  };

  const navigateImage = (direction: number) => {
    if (selectedIndex === null) return;
    const nextIndex = selectedIndex + direction;
    if (nextIndex >= 0 && nextIndex < images.length) {
      setSelectedIndex(nextIndex);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Gallery Management</h1>
        <label className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold cursor-pointer hover:shadow-lg">
          {uploading ? 'Uploading...' : 'Add Pictures'}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      </div>

      {loading ? <div className="text-center py-20"><Loader2 className="animate-spin" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img._id} className="relative group rounded-xl overflow-hidden shadow-sm bg-gray-100">
              <img 
                src={img.imageUrl} 
                className="w-full h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => setSelectedIndex(index)}
              />
              <button onClick={() => setDeleteConfirm(img)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <h2 className="font-bold mb-4">Confirm Delete</h2>
            <p className="text-sm mb-6">Are you sure you want to delete this picture?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button className="absolute top-5 right-5 text-white p-2" onClick={() => setSelectedIndex(null)}><X size={32}/></button>
          <button className="absolute left-5 text-white" onClick={() => navigateImage(-1)}><ChevronLeft size={48}/></button>
          <img src={images[selectedIndex].imageUrl} className="max-h-[90vh] max-w-[90vw] object-contain" />
          <button className="absolute right-5 text-white" onClick={() => navigateImage(1)}><ChevronRight size={48}/></button>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;