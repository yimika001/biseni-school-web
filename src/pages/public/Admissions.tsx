import { ArrowRight, CheckCircle2, FileText, ClipboardList, Users, BadgeCheck, AlertCircle, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admissions = () => {
  const steps = [
    {
      icon: <FileText size={24} />,
      title: 'Obtain Application Form',
      desc: 'Collect the official admission form from the school\'s administrative block during office hours (Monday – Friday, 8:00am – 3:00pm). Forms may also be downloaded from this website.',
      tag: 'Step 1'
    },
    {
      icon: <ClipboardList size={24} />,
      title: 'Entrance Examination',
      desc: 'Prospective JSS1 students sit a placement test in Mathematics and English Language. Candidates transferring to higher classes will be assessed based on their previous school results and an equivalency test.',
      tag: 'Step 2'
    },
    {
      icon: <Users size={24} />,
      title: 'Parent & Student Interview',
      desc: 'A brief session with the student and parent or guardian to align on school rules, values, and expectations. This is not an elimination stage — it is an orientation.',
      tag: 'Step 3'
    },
    {
      icon: <BadgeCheck size={24} />,
      title: 'Registration & Enrolment',
      desc: 'Upon acceptance, submit all required documents, pay the registration fee, and receive your school ID. Your child is now officially a Biseni Secondary School student.',
      tag: 'Step 4'
    }
  ];

  const jssRequirements = [
    'Completed and signed Application Form',
    'Two (2) recent passport photographs',
    'Photocopy of Birth Certificate or Declaration of Age',
    'Primary School Leaving Certificate (FSLC)',
    'Last academic report card from previous school',
    'Photocopy of parent or guardian\'s valid ID',
  ];

  const sssRequirements = [
    'Completed and signed Application Form',
    'Two (2) recent passport photographs',
    'JSS3 BECE result (NECO Basic Education Certificate)',
    'Junior Secondary School leaving certificate',
    'Academic report cards from JSS1–JSS3',
    'Letter of good conduct from previous school',
    'Photocopy of parent or guardian\'s valid ID',
  ];

  return (
    <div className="flex flex-col w-full">

      {/* 1. HEADER */}
      <section className="bg-white py-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <span className="text-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">
            Join Our Community
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
            Begin Your <span className="text-primary">Journey.</span>
          </h1>
          <p className="max-w-2xl text-gray-500 text-lg font-medium leading-relaxed">
            Biseni Secondary School welcomes applications from motivated students ready to grow 
            academically and in character. Our admission process is transparent, fair, and 
            designed to ensure every child thrives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href="#apply" className="bg-primary text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
              Start Application <ArrowRight size={18} />
            </a>
            <Link to="/contact" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ADMISSION NOTICE */}
      <section className="bg-accent py-5">
        <div className="container mx-auto px-6 flex items-center gap-3">
          <AlertCircle size={16} className="text-primary shrink-0" />
          <p className="text-primary font-black text-xs uppercase tracking-widest">
            Admissions are open for the current academic session. Contact the school office for available spaces per class.
          </p>
        </div>
      </section>

      {/* 3. TWO ENTRY POINTS */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Entry Points</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">When Can You Apply?</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* JSS1 Entry */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all">
              <div className="bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 font-black text-lg">
                JSS
              </div>
              <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">Junior Secondary Entry</h4>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                Open to Primary 6 leavers who have obtained their First School Leaving Certificate (FSLC). 
                Students enter at JSS1 and sit an entrance examination in Mathematics and English Language.
              </p>
              <div className="bg-primary/5 rounded-2xl p-5">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Entry Class</p>
                <p className="font-black text-gray-900">JSS1 (Year 7)</p>
              </div>
            </div>

            {/* SS1 Entry */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-xl hover:shadow-primary/10 transition-all">
              <div className="bg-accent text-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-6 font-black text-lg">
                SS
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tight mb-3">Senior Secondary Entry</h4>
              <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
                Open to JSS3 graduates who have obtained their Basic Education Certificate (BECE) from NECO. 
                Candidates are assessed and placed into the appropriate academic department based on results.
              </p>
              <div className="bg-white/10 rounded-2xl p-5">
                <p className="text-xs font-black text-accent uppercase tracking-widest mb-1">Entry Class</p>
                <p className="font-black text-white">SS1 (Year 10)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ADMISSION STEPS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">The Process</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">How to Apply</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                      {step.tag}
                    </span>
                  </div>
                  <h4 className="font-black text-gray-900 uppercase text-sm tracking-wide mb-3">{step.title}</h4>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 w-6 h-6 bg-primary text-white rounded-full items-center justify-center">
                    <ArrowRight size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. REQUIREMENTS */}
      <section id="apply" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">What to Bring</h2>
            <h3 className="text-4xl font-black text-gray-900 uppercase">Required Documents</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* JSS Requirements */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm">JSS</div>
                <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Junior Secondary Entry</h4>
              </div>
              <ul className="space-y-4">
                {jssRequirements.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-gray-700 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* SS1 Requirements */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-accent text-primary w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm">SS</div>
                <h4 className="font-black uppercase text-sm tracking-widest">Senior Secondary Entry</h4>
              </div>
              <ul className="space-y-4">
                {sssRequirements.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-gray-300 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 max-w-5xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm font-bold">
              All photocopies must be accompanied by originals for verification. Incomplete documentation 
              will delay the admission process. The school reserves the right to withdraw admission 
              if any submitted document is found to be falsified.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FEES NOTE */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-black text-white uppercase mb-4">School Fees & Levies</h3>
          <p className="text-white/70 font-medium max-w-xl mx-auto mb-6 text-sm leading-relaxed">
            As a Bayelsa State government school, tuition is subsidised. Students are responsible 
            for PTA levies, examination fees, and approved school uniforms. 
            Contact the school bursar for the current fee schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+234" className="bg-white text-primary px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all">
              <Phone size={16} /> Call the School Office
            </a>
            <Link to="/contact" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3">
              <Mail size={16} /> Send an Enquiry
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Admissions;