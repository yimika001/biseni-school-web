import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Megaphone, Tag, ArrowRight } from 'lucide-react';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
       const res = await axios.get(`${import.meta.env.VITE_API_URL}/announcements/public`);
        // Filter only published items
        const published = res.data.announcements.filter((a: any) => a.isPublished);
        setNewsItems(published);
      } catch (err) { console.error("Error fetching news:", err); } 
      finally { setLoading(false); }
    };
    fetchNews();
  }, []);

  return (
    <div className="flex flex-col w-full py-24 bg-gray-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-black mb-12">News & Events.</h1>
        {loading ? <p>Loading updates...</p> : (
          <div className="space-y-6">
            {newsItems.map((item: any) => (
              <article key={item._id} className="bg-white rounded-[2rem] border p-8 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{item.category}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-3xl font-black mb-4">{item.title}</h2>
                <p className="text-gray-500 mb-6">{item.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;