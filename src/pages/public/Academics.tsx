import { BookOpen, Award, Clock, CheckCircle, FlaskConical, Landmark, Briefcase, Globe } from 'lucide-react';

const Academics = () => {
  const departments = [
    {
      icon: <FlaskConical size={24} />,
      name: 'Science & Mathematics',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      subjects: ['Further Mathematics', 'Physics', 'Chemistry', 'Biology', 'Agricultural Science', 'Computer Studies']
    },
    {
      icon: <Landmark size={24} />,
      name: 'Humanities & Arts',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      subjects: ['Literature in English', 'Government', 'Christian Religious Studies', 'History', 'Fine Arts', 'Yoruba / Ijaw Language']
    },
    {
      icon: <Briefcase size={24} />,
      name: 'Business & Commercial',
      color: 'bg-green-50 text-green-700 border-green-100',
      iconBg: 'bg-green-100 text-green-600',
      subjects: ['Financial Accounting', 'Commerce', 'Economics', 'Insurance', 'Office Practice', 'Store Management']
    },
    {
      icon: <Globe size={24} />,
      name: 'General & Vocational',
      color: 'bg-purple-50 text-purple-700 border-purple-100',
      iconBg: 'bg-purple-100 text-purple-600',
      subjects: ['English Language', 'Mathematics', 'Civic Education', 'Data Processing', 'Home Economics', 'Dyeing & Bleaching']
    }
  ];

  const examinations = [
    { label: 'BECE', full: 'Basic Education Certificate Examination', level: 'JSS3 Exit Exam', body: 'NECO' },
    { label: 'WASSCE', full: 'West African Senior School Certificate', level: 'SSS3 Final Exam', body: 'WAEC' },
    { label: 'NECO SSCE', full: 'National Examination Council SSCE', level: 'SSS3 Final Exam', body: 'NECO' },
    { label: 'JAMB UTME', full: 'Unified Tertiary Matriculation Examination', level: 'University Entry', body: 'JAMB' },
  ];

  return (
    <div className="flex flex-col w-full">

      {/* 1. HEADER */}
      <section className="bg-white py-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <span className="text-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">
            Academic Programme
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
            Built for <span className="text-primary">Excellence.</span>
          </h1>
          <p className="max-w-2xl text-gray-500 text-lg font-medium leading-relaxed">
            Our full six-year academic programme — JSS1 through SS3 — is aligned with the Nigerian 
            National Policy on Education (6-3-3-4 system) and prepares every student for WAEC, 
            NECO, and JAMB success.
          </p>
        </div>
      </section>

      {/* 2. STRUCTURE OVERVIEW */}
<section className="py-16 bg-primary">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { value: 'JSS1 – JSS3', label: 'Junior Secondary School', sub: '3 Years' },
        { value: 'SS1 – SS3', label: 'Senior Secondary School', sub: '3 Years' },
        { value: 'WAEC & NECO', label: 'Examination Bodies', sub: 'Accredited Centre' },
        { value: '4 Departments', label: 'Academic Streams', sub: 'Science, Arts, Commerce, Vocational' },
      ].map((stat) => (
        <div key={stat.label} className="bg-white/10 rounded-2xl p-6 flex items-center sm:flex-col sm:items-center gap-4 sm:gap-0 sm:text-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 sm:hidden">
            <div className="w-2 h-2 rounded-full bg-accent" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-black text-white mb-0.5">{stat.value}</p>
            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
            <p className="text-[10px] text-accent font-black uppercase tracking-widest">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* 3. JSS PROGRAMME */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Years 1 – 3</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">Junior Secondary School</h3>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
              JSS is free and compulsory. All students follow a broad, unified curriculum 
              before streaming into departments at Senior Secondary level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-5 text-primary">Core Subjects (All Students)</h4>
              <div className="space-y-3">
                {['English Language', 'Mathematics', 'Basic Science & Technology', 'Social Studies', 'Civic Education', 'Cultural & Creative Arts', 'Business Studies', 'Computer Studies', 'French (Introductory)', 'Home Economics'].map((s) => (
                  <div key={s} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                    <CheckCircle size={14} className="text-primary shrink-0" /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 p-8 rounded-3xl text-white">
              <h4 className="font-black uppercase text-sm tracking-widest mb-5 text-accent">JSS Exit Examination</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                At the end of JSS3, students sit the <strong className="text-white">Basic Education Certificate Examination (BECE)</strong>, 
                administered by NECO. A pass is required for progression to Senior Secondary School.
              </p>
              <div className="bg-white/10 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Examining Body</p>
                <p className="text-white font-black text-lg">NECO — National Examinations Council</p>
              </div>
              <div className="mt-4 bg-white/10 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Progression</p>
                <p className="text-white font-black">BECE Pass → SS1 Admission</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEPARTMENTS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Years 4 – 6</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">Senior Secondary Departments</h3>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-medium">
              At SS1, students are streamed into one of four academic departments based on their 
              aptitude, BECE results, and career aspirations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <div key={dept.name} className={`rounded-3xl p-6 border ${dept.color} hover:shadow-xl transition-all`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${dept.iconBg}`}>
                  {dept.icon}
                </div>
                <h3 className="font-black uppercase text-sm tracking-wide mb-4">{dept.name}</h3>
                <ul className="space-y-2">
                  {dept.subjects.map((subject) => (
                    <li key={subject} className="text-sm flex items-center gap-2 text-gray-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                      {subject}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mt-8">
            * Core subjects — English Language, Mathematics, and Civic Education — are compulsory across all departments.
          </p>
        </div>
      </section>

      {/* 5. EXAMINATIONS */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Certification</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">Examinations We Prepare You For</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {examinations.map((exam) => (
              <div key={exam.label} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                  <Award size={26} />
                </div>
                <p className="font-black text-2xl text-primary mb-1">{exam.label}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{exam.level}</p>
                <p className="text-sm text-gray-600 font-medium mb-4 leading-snug">{exam.full}</p>
                <span className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {exam.body}
                </span>
              </div>
            ))}
          </div>

          {/* Grading system */}
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-14 text-white max-w-3xl mx-auto">
            <h4 className="font-black text-xl uppercase tracking-tight mb-6 text-accent">WAEC / NECO Grading Scale</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { grade: 'A1', range: '75–100%', label: 'Excellent', color: 'text-green-400' },
                { grade: 'B2', range: '70–74%', label: 'Very Good', color: 'text-green-400' },
                { grade: 'B3', range: '65–69%', label: 'Good', color: 'text-green-400' },
                { grade: 'C4', range: '60–64%', label: 'Credit', color: 'text-blue-400' },
                { grade: 'C5', range: '55–59%', label: 'Credit', color: 'text-blue-400' },
                { grade: 'C6', range: '50–54%', label: 'Credit', color: 'text-blue-400' },
              ].map((g) => (
                <div key={g.grade} className="bg-white/5 rounded-xl p-4">
                  <p className={`text-2xl font-black ${g.color}`}>{g.grade}</p>
                  <p className="text-gray-400 text-xs font-bold">{g.range}</p>
                  <p className="text-white text-xs font-bold uppercase tracking-wider">{g.label}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs font-bold">
              * University admission in Nigeria requires a minimum of 5 credits (C6 and above) including English Language and Mathematics. 
              Grades A1–C6 count as credits for JAMB university screening.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALENDAR */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">School Year</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">Academic Calendar</h3>
          </div>
          <div className="space-y-4">
            {[
              { term: 'First Term', months: 'September — December', note: 'Resumption · Mid-term break · First term exams' },
              { term: 'Second Term', months: 'January — April', note: 'Resumption · Mid-term break · Second term exams' },
              { term: 'Third Term', months: 'May — July', note: 'Resumption · WAEC/NECO exams · Graduation' },
            ].map((item, i) => (
              <div key={item.term} className="flex items-center gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-black text-gray-900 uppercase text-sm tracking-widest">{item.term}</p>
                    <p className="font-black text-primary text-sm">{item.months}</p>
                  </div>
                  <p className="text-gray-500 text-xs font-bold mt-1">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
            <Clock size={12} /> Specific dates are subject to Bayelsa State Ministry of Education directives
          </p>
        </div>
      </section>

    </div>
  );
};

export default Academics;