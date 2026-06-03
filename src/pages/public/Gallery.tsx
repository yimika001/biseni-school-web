import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Gallery = () => {
  const [images, setImages] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/gallery`).then(res => setImages(res.data));
  }, []);

  const navigateImage = (direction: number) => {
    if (selectedIndex === null) return;
    const nextIndex = selectedIndex + direction;
    if (nextIndex >= 0 && nextIndex < images.length) setSelectedIndex(nextIndex);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">School Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <div key={img._id} className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={img.imageUrl} 
              className="w-full h-64 object-contain cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => setSelectedIndex(index)}
            />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button className="absolute top-5 right-5 text-white" onClick={() => setSelectedIndex(null)}><X size={32}/></button>
          <button className="absolute left-5 text-white" onClick={() => navigateImage(-1)}><ChevronLeft size={48}/></button>
          <img src={images[selectedIndex].imageUrl} className="max-h-full max-w-full object-contain" />
          <button className="absolute right-5 text-white" onClick={() => navigateImage(1)}><ChevronRight size={48}/></button>
        </div>
      )}
    </div>
  );
};
export default Gallery;