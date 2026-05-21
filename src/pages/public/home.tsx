/// <reference types="react" />
import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Trophy, 
  Users, 
  CheckCircle2,
  BookOpen,
  Waves
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col w-full">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1523050853063-913ec36b5995?auto=format&fit=crop&q=80" 
            alt="Biseni Secondary School Campus" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-4 rounded-full bg-primary/20 text-accent text-xs font-bold uppercase tracking-[0.2em] mb-6 border border-accent/30">
              Mbiama/Biseni Road, Kalama · Yenagoa LGA · Bayelsa State
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Deeds, <span className="text-primary italic">Not</span> Words.
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed font-medium">
              From the riverine heartland of Biseni Kingdom, we raise a generation of courageous, educated Ijaw sons and daughters — ready to lead Bayelsa and Nigeria into its next chapter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/portal" className="bg-primary text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                Access Student Portal <ArrowRight size={18} />
              </Link>
              <Link to="/admissions" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center">
                Apply for Admission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK STATS */}
      <section className="bg-primary py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "JSS1 – SS3", label: "Full 6-Year Programme" },
              { value: "WAEC & NECO", label: "Examination Centre" },
              { value: "Kalama", label: "Biseni Kingdom, Yenagoa" },
              { value: "Bayelsa State", label: "Government Accredited" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-white/70 uppercase tracking-widest mt-1 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-3">Our Identity</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Why Biseni Secondary School?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all group">
              <div className="bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Proven Character</h4>
              <p className="text-gray-500 leading-relaxed font-medium">
                "Deeds Not Words" is not just our motto — it is our blueprint. We build students of discipline and integrity who act with purpose in every sphere of life.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all group">
              <div className="bg-accent text-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <BookOpen size={28} />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Academic Rigour</h4>
              <p className="text-gray-500 leading-relaxed font-medium">
                Fully aligned with the Bayelsa State curriculum and accredited for WAEC and NECO examinations. Our Science and Arts departments are built for competitive excellence.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all group">
              <div className="bg-green-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <Waves size={28} />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Riverine Resilience</h4>
              <p className="text-gray-500 leading-relaxed font-medium">
                Rooted in the Biseni Kingdom — an Inland Ijaw community of remarkable strength. We turn the challenges of our riverine environment into fuel for academic ambition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            <img 
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80" 
              alt="Students Learning" 
              className="rounded-[3rem] shadow-2xl relative z-10"
            />
          </div>
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Our Story</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase leading-tight mb-6">
              The Academic Heartbeat of Biseni Kingdom.
            </h3>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed font-medium">
              Located along the Mbiama/Biseni Road in Kalama, Yenagoa LGA, Biseni Secondary School stands as the foremost government institution serving the Biseni people — an Inland Ijaw community bordered by the Gbaran, Zarama, and Okordia tribes in the heart of Bayelsa State.
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">
              In a region where communities are often surrounded by water and access to education is a hard-won privilege, this school has remained a beacon of hope — bridging the gap between riverine life and academic opportunity for generations of Biseni sons and daughters.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-900 font-black uppercase text-sm">
                <CheckCircle2 className="text-green-500 shrink-0" size={18} /> Bayelsa State Government Accredited (JSS & SSS)
              </div>
              <div className="flex items-center gap-4 text-gray-900 font-black uppercase text-sm">
                <CheckCircle2 className="text-green-500 shrink-0" size={18} /> Registered WAEC & NECO Examination Centre
              </div>
              <div className="flex items-center gap-4 text-gray-900 font-black uppercase text-sm">
                <CheckCircle2 className="text-green-500 shrink-0" size={18} /> Serving Yenagoa LGA and the wider Biseni Kingdom
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE BISENI VISION */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform origin-right" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em] mb-4">Our Vision</h2>
              <h3 className="text-4xl font-black text-white uppercase leading-tight mb-8">
                Empowering the children of the creeks to <span className="text-primary">lead</span> the nation.
              </h3>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Bayelsa State — the Glory of all Lands — contributes nearly 40% of Nigeria's oil and gas output, yet its riverine communities remain among the most underserved in the country. At Biseni Secondary School, we believe the children of this land deserve world-class education. Our pledge is to raise Ijaw sons and daughters who are educated, courageous, and ready to act on the world stage.
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10">
                    <Trophy size={24} />
                  </div>
                  <h5 className="text-white font-bold uppercase text-xs tracking-widest">University Pathways</h5>
                  <p className="text-gray-500 text-xs font-medium leading-loose">Preparing students for Federal University Otuoke, Niger Delta University Amassoma, and top institutions across Nigeria.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent border border-white/10">
                    <Globe size={24} />
                  </div>
                  <h5 className="text-white font-bold uppercase text-xs tracking-widest">Cultural Pride</h5>
                  <p className="text-gray-500 text-xs font-medium leading-loose">Honouring the Biseni Inland Ijaw heritage and the resilience of a people who have thrived along the creeks and forests of Yenagoa for generations.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/10 relative">
              <div className="absolute -top-6 -right-6 bg-accent text-primary p-6 rounded-3xl rotate-12 shadow-xl hidden md:block">
                <p className="text-2xl font-black italic">"Deeds!"</p>
              </div>
              <h4 className="text-2xl font-black text-white uppercase mb-6 tracking-tight">The Principal's Charge</h4>
              <blockquote className="text-gray-300 italic text-lg leading-relaxed mb-8">
                "In Biseni, we don't just teach students to read — we teach them to lead. Our environment demands resilience, and our curriculum builds it. We are raising a generation that will be the architects of a greater Bayelsa and a stronger Nigeria."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full border-2 border-primary" />
                <div>
                  <p className="text-white font-black uppercase text-sm tracking-widest">The Principal</p>
                  <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Biseni Secondary School, Kalama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="py-20 bg-white text-center px-6">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter mb-6">
          Be Part of the <span className="text-primary">Legacy.</span>
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 font-medium leading-relaxed">
          Whether you are a prospective student, a parent, or an alumnus of Biseni Secondary School — this community is yours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/admissions" className="bg-primary text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
            Apply for Admission <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center">
            Learn Our Story
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;