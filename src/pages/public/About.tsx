import { 
  Target, 
  Eye, 
  Award, 
  ShieldCheck, 
  Users,
  Star,
  Waves,
  BookOpen,
  CheckCircle2,
  MapPin
} from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col w-full">

      {/* 1. HERO HEADER */}
      <section className="bg-white py-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <span className="text-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">
            Our Story · Biseni Kingdom · Yenagoa LGA
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
            Deeds Not <span className="text-primary">Words</span>.
          </h1>
          <p className="max-w-2xl text-gray-500 text-lg font-medium leading-relaxed">
            From the creeks and forests of the Biseni Kingdom in Yenagoa Local Government Area, 
            Biseni Secondary School has stood as the academic backbone of an Inland Ijaw community 
            determined to rise — generation after generation.
          </p>
        </div>
      </section>

      {/* 2. LOCATION BANNER */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <MapPin size={18} className="text-accent" />
            <span className="text-sm font-bold uppercase tracking-widest">Mbiama/Biseni Road, Kalama, Yenagoa LGA, Bayelsa State</span>
          </div>
          <div className="flex flex-wrap gap-6 text-white/70 text-xs font-bold uppercase tracking-widest">
            <span>JSS1 — SS3</span>
            <span>·</span>
            <span>WAEC Accredited</span>
            <span>·</span>
            <span>NECO Accredited</span>
            <span>·</span>
            <span>Government Owned</span>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            <img 
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80" 
              alt="Biseni Secondary School Students" 
              className="rounded-[3rem] shadow-2xl relative z-10 w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 border border-gray-100">
              <p className="text-3xl font-black text-primary">Biseni</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Inland Ijaw · Yenagoa LGA</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Our History</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase leading-tight mb-6">
              The Academic Heartbeat of the Biseni Kingdom.
            </h3>
            <p className="text-gray-600 text-base mb-6 leading-relaxed font-medium">
              Biseni Secondary School is a government-owned institution located along the Mbiama/Biseni Road 
              in Kalama, Yenagoa Local Government Area of Bayelsa State. It serves the Biseni people — 
              a distinct Inland Ijaw community, bordered by the Gbaran clan to the north and the Zarama 
              and Okordia tribes to the northeast.
            </p>
            <p className="text-gray-600 text-base mb-8 leading-relaxed font-medium">
              In a region where riverine geography has historically made access to quality education 
              a hard-won privilege, Biseni Secondary School has remained an unwavering institution — 
              bridging the gap between life along the creeks and the academic opportunity that unlocks 
              a brighter future. The school speaks to the resilience of a people who have built 
              community and culture in one of Nigeria's most ecologically unique landscapes.
            </p>
            <div className="space-y-3">
              {[
                'Bayelsa State Government Accredited (JSS1–SS3)',
                'Registered WAEC & NECO Examination Centre',
                'Full 6-3-3-4 Nigerian National Curriculum',
                'Serving Kalama, Biseni Kingdom and surrounding communities'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-gray-800 font-bold text-sm">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-10 md:p-14 rounded-[3rem] border border-gray-100 group hover:border-primary/30 hover:shadow-xl transition-all">
            <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-6">Our Mission</h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              To provide a transformative learning environment where the youth of Biseni Kingdom 
              are equipped with intellectual tools, moral fortitude, and the confidence to compete 
              at every level — from Bayelsa State to the global stage — through deeds, not mere words.
            </p>
          </div>

          <div className="bg-gray-900 p-10 md:p-14 rounded-[3rem] shadow-xl group transition-all text-white">
            <div className="bg-accent text-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Eye size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Our Vision</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              To be the premier secondary institution serving the riverine communities of Yenagoa LGA, 
              producing graduates who embody our motto — proven by visible excellence, community 
              leadership, and lifelong integrity.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CORE PILLARS */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">The Biseni Way</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">What We Stand For</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck size={28} />, title: "Discipline", desc: "We hold every student to a standard of conduct that builds character long after the school gates close." },
              { icon: <BookOpen size={28} />, title: "Scholarship", desc: "Aligned with the Nigerian 6-3-3-4 curriculum and preparing students for WAEC, NECO, and JAMB excellence." },
              { icon: <Users size={28} />, title: "Community", desc: "Proudly Biseni, proudly Ijaw. We honour our Inland Ijaw heritage and the spirit of collective progress." },
              { icon: <Waves size={28} />, title: "Resilience", desc: "In a riverine region that demands adaptability, our students learn to overcome every obstacle through effort and faith." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all text-center group">
                <div className="text-primary flex justify-center mb-5 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-3">{item.title}</h4>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BISENI CONTEXT */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform origin-right" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em] mb-4">Understanding Our Roots</h2>
              <h3 className="text-4xl font-black text-white uppercase leading-tight mb-8">
                A school shaped by <span className="text-primary">where we come from.</span>
              </h3>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                The Biseni people are a small but deeply rooted Inland Ijaw community in Bayelsa State — 
                a state that produces nearly 40% of Nigeria's oil and gas output, yet whose riverine 
                communities remain among the most underserved in the country when it comes to educational infrastructure.
              </p>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Annual flooding, creek-bound geography, and limited road access have historically 
                made education a challenge for Biseni youth. This school exists precisely to meet 
                that challenge — offering a stable, government-backed institution that serves 
                students from Kalama and the broader Biseni Kingdom.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: <Award size={22} />, title: "University Pathways", desc: "Preparing students for Federal University Otuoke, Niger Delta University Amassoma, and institutions across Nigeria." },
                  { icon: <Star size={22} />, title: "Cultural Identity", desc: "Honouring the Biseni Inland Ijaw dialect, traditions, and the strength of a people tied to the Niger Delta creeks." }
                ].map((item) => (
                  <div key={item.title} className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                      {item.icon}
                    </div>
                    <h5 className="text-white font-bold uppercase text-xs tracking-widest">{item.title}</h5>
                    <p className="text-gray-500 text-xs font-medium leading-loose">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Principal's Quote */}
            <div className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/10 relative">
              <div className="absolute -top-6 -right-6 bg-accent text-primary p-6 rounded-3xl rotate-12 shadow-xl hidden md:block">
                <p className="text-2xl font-black italic">"Deeds!"</p>
              </div>
              <div className="flex items-center gap-2 text-accent mb-6">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <h4 className="text-2xl font-black text-white uppercase mb-6 tracking-tight">A Word from Leadership</h4>
              <blockquote className="text-gray-300 italic text-lg leading-relaxed mb-8">
                "In Biseni, we don't just teach students to read — we teach them to lead. Our 
                environment demands resilience, and our curriculum builds it. Every student who 
                passes through these gates carries the spirit of the Ijaw people: courageous, 
                educated, and ready to act."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-white">B</div>
                <div>
                  <p className="text-white font-black uppercase text-sm tracking-widest">School Administration</p>
                  <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Biseni Secondary School, Kalama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;