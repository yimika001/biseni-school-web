import React from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form handling logic goes here
  };

  return (
    <div className="flex flex-col w-full">

      {/* 1. HEADER */}
      <section className="bg-white py-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <span className="text-primary font-black uppercase text-xs tracking-[0.3em] mb-4 block">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
            We're Here to <span className="text-primary">Help.</span>
          </h1>
          <p className="max-w-2xl text-gray-500 text-lg font-medium leading-relaxed">
            Whether you have questions about admissions, academics, or general enquiries,
            our team is available during school hours to assist you.
          </p>
        </div>
      </section>

      {/* 2. CONTACT CARDS */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <MapPin size={22} />,
                label: 'Our Location',
                value: 'Mbiama/Biseni Road, Kalama',
                sub: 'Yenagoa LGA, Bayelsa State'
              },
              {
                icon: <Phone size={22} />,
                label: 'Phone',
                value: '+234 (0) 800 123 4567',
                sub: 'Monday – Friday, 8am – 3pm'
              },
              {
                icon: <Mail size={22} />,
                label: 'Email',
                value: 'info@biseni-school.edu.ng',
                sub: 'We reply within 24 hours'
              },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-2xl p-6 flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-white font-black text-sm">{item.value}</p>
                  <p className="text-white/50 text-[10px] font-bold mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FORM + INFO */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">

            {/* Left — Info */}
            <div>
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Before You Write</h2>
              <h3 className="text-3xl font-black text-gray-900 uppercase leading-tight mb-6">
                Frequently Asked Questions
              </h3>

              <div className="space-y-5">
                {[
                  {
                    q: 'When is the admission form available?',
                    a: 'Forms are available at the administrative block during every new academic session. Check the News page for announcements.'
                  },
                  {
                    q: 'Does the school offer boarding?',
                    a: 'Biseni Secondary School currently operates as a day school. Students commute daily from Kalama and surrounding communities.'
                  },
                  {
                    q: 'What are the school hours?',
                    a: 'School runs Monday to Friday, 7:30am to 2:30pm. Administrative office hours are 8:00am to 3:00pm.'
                  },
                  {
                    q: 'Who do I contact for result enquiries?',
                    a: 'Results-related questions should be directed to the school\'s examination office. Students can also access results via the Student Portal.'
                  },
                ].map((faq) => (
                  <div key={faq.q} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <MessageSquare size={14} className="text-primary shrink-0 mt-1" />
                      <div>
                        <p className="font-black text-gray-900 text-sm uppercase tracking-tight mb-2">{faq.q}</p>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office Hours */}
              <div className="mt-8 bg-gray-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={16} className="text-accent" />
                  <p className="font-black uppercase text-xs tracking-widest">Office Hours</p>
                </div>
                <div className="space-y-2">
                  {[
                    { day: 'Monday – Friday', time: '8:00am – 3:00pm' },
                    { day: 'Saturday', time: 'Closed' },
                    { day: 'Sunday', time: 'Closed' },
                  ].map((h) => (
                    <div key={h.day} className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">{h.day}</span>
                      <span className={`font-black ${h.time === 'Closed' ? 'text-red-400' : 'text-accent'}`}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Send a Message</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">We'll respond within one business day</p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="e.g. Amaka Jonah"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="yourname@email.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white">
                    <option value="">Select a subject</option>
                    <option>Admission Enquiry</option>
                    <option>Academic Information</option>
                    <option>Result / Portal Issue</option>
                    <option>School Fees</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Your Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                  Send Message <Send size={16} />
                </button>

                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Your information is safe with us and will not be shared.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAP PLACEHOLDER */}
      <section className="bg-gray-200 h-64 md:h-80 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <MapPin size={32} className="text-primary" />
          <p className="font-black text-gray-700 uppercase text-sm tracking-widest">Mbiama/Biseni Road, Kalama</p>
          <p className="text-gray-500 text-xs font-bold">Yenagoa LGA, Bayelsa State, Nigeria</p>
          
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noreferrer"
            className="mt-2 bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 transition-all"
          >
            Open in Google Maps
          </a>
        </div>
      </section>

    </div>
  );
};

export default Contact;