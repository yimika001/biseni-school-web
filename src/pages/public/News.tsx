import { Calendar, Megaphone, Trophy, Monitor, ArrowRight, Tag } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    category: 'Sports',
    icon: <Trophy size={16} />,
    title: 'Inter-House Sports Competition 2026',
    date: 'April 15, 2026',
    excerpt: 'Students from all four houses — Fire, Water, Earth, and Wind — will compete across athletics, football, and field events. Parents and guardians are warmly invited to cheer on our champions.',
    tag: 'Upcoming Event',
    tagColor: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    id: 2,
    category: 'Infrastructure',
    icon: <Monitor size={16} />,
    title: 'ICT Laboratory Upgraded with 20 New Computers',
    date: 'March 28, 2026',
    excerpt: 'The school administration is pleased to announce the acquisition of 20 new desktop computers for the ICT laboratory. This upgrade significantly enhances digital literacy training for all JSS and SSS students.',
    tag: 'Announcement',
    tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 3,
    category: 'Academic',
    icon: <Megaphone size={16} />,
    title: 'Third Term Examination Timetable Released',
    date: 'March 10, 2026',
    excerpt: 'The third term examination timetable has been approved and distributed to all class teachers. Students are advised to collect their copies from their form masters and begin preparation immediately.',
    tag: 'Notice',
    tagColor: 'bg-green-50 text-green-600 border-green-200',
  },
];

const News = () => {
  return (
    <div className="flex flex-col w-full">

      {/* 1. HEADER */}
      <section className="bg-white py-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <span className="text-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">
            Latest Updates
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
            News & <span className="text-primary">Events.</span>
          </h1>
          <p className="max-w-2xl text-gray-500 text-lg font-medium leading-relaxed">
            Stay informed on the latest happenings, announcements, and achievements 
            from Biseni Secondary School, Kalama.
          </p>
        </div>
      </section>

      {/* 2. NOTICE BANNER */}
      <section className="bg-primary py-5">
        <div className="container mx-auto px-6 flex items-center gap-3">
          <Megaphone size={16} className="text-accent shrink-0" />
          <p className="text-white font-black text-xs uppercase tracking-widest">
            Third term is ongoing — Inter-House Sports comes up April 15, 2026. All students must participate.
          </p>
        </div>
      </section>

      {/* 3. NEWS LIST */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">

          <div className="space-y-6">
            {newsItems.map((item, index) => (
              <article
                key={item.id}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all overflow-hidden group"
              >
                <div className="p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    {/* Category tag */}
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.tagColor}`}>
                      {item.icon} {item.tag}
                    </span>
                    {/* Date */}
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Calendar size={11} /> {item.date}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-4 group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>

                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                    {item.excerpt}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                      <Tag size={11} /> {item.category}
                    </span>
                    <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border-b border-transparent hover:border-primary transition-all group-hover:gap-3">
                      Read More <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div className="h-1 w-0 group-hover:w-full bg-primary transition-all duration-500" />
              </article>
            ))}
          </div>

          {/* Empty state for when more news loads */}
          <div className="mt-16 text-center py-12 border border-dashed border-gray-200 rounded-[2rem]">
            <Megaphone size={32} className="text-gray-300 mx-auto mb-4" />
            <p className="font-black text-gray-400 uppercase text-sm tracking-widest mb-1">More Updates Coming</p>
            <p className="text-gray-400 text-xs font-medium">
              New announcements will appear here as they are published by the school administration.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default News;