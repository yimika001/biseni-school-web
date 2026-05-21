import { ArrowRight, BookOpen, ShieldCheck, Users } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#008751 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h2 className="text-sm font-semibold text-accent tracking-wide uppercase">
                Welcome to Biseni Secondary School
              </h2>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline text-primary">Excellence in Education</span>{' '}
                <span className="block text-primary-dark xl:inline">& Character</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Empowering the next generation of leaders in Bayelsa State through rigorous academics, 
                cultural integrity, and innovative learning. Join a community dedicated to success.
              </p>
              
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                <button className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10 transition-all shadow-lg hover:shadow-primary/30">
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="flex items-center justify-center px-8 py-3 border-2 border-primary text-base font-bold rounded-md text-primary bg-transparent hover:bg-green-50 md:py-4 md:text-lg md:px-10 transition-all">
                  Take a Tour
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Hero Image Side */}
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full bg-primary-light sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center text-white relative">
          {/* Placeholder for actual school photo */}
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1523050335392-9ae5645a2177?auto=format&fit=crop&q=80&w=1000"
            alt="School building"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;