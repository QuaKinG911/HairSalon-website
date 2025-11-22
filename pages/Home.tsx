import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Scissors } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b7f30a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Barber Shop Interior"
            className="w-full h-full object-cover filter brightness-[0.4] saturate-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <div className="inline-block border border-amber-500/30 bg-black/30 backdrop-blur-sm px-4 py-1 rounded-full text-amber-500 text-sm font-bold tracking-widest uppercase mb-4">
            Premium Men's Grooming
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight">
            Refine Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Legacy</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Where traditional barbering meets modern innovation. Experience our AI consultation and master craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="/booking"
              className="px-10 py-4 bg-amber-600 text-black rounded-sm font-bold uppercase tracking-wider hover:bg-amber-500 transition-all transform hover:-translate-y-1 shadow-lg shadow-amber-900/20"
            >
              Book Appointment
            </Link>
            <Link
              to="/ai-try-on"
              className="px-10 py-4 bg-transparent text-white border border-white/20 rounded-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={18} className="text-amber-400" />
              AI Style Consult
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-white relative z-20 -mt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-10 rounded-sm border-b-4 border-amber-600 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gray-900 text-amber-500 rounded-lg flex items-center justify-center mb-6">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">AI Face Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your photo to let our smart algorithms suggest the perfect cut for your specific face shape and hair type before the scissors touch.
              </p>
            </div>
            <div className="bg-gray-50 p-10 rounded-sm border-b-4 border-amber-600 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gray-900 text-amber-500 rounded-lg flex items-center justify-center mb-6">
                <Scissors size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">Master Barbers</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team consists of industry veterans who have mastered the art of both classic cuts and modern fades.
              </p>
            </div>
            <div className="bg-gray-50 p-10 rounded-sm border-b-4 border-amber-600 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gray-900 text-amber-500 rounded-lg flex items-center justify-center mb-6">
                <Star size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">VIP Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy a complimentary whiskey or espresso, hot towel service, and a relaxing atmosphere designed for the modern man.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 border-2 border-amber-600/30 rounded-sm transform translate-x-4 translate-y-4"></div>
              <img
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Barber cutting hair"
                className="relative rounded-sm shadow-2xl w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="md:w-1/2 space-y-8">
              <span className="text-amber-500 font-bold tracking-widest text-sm uppercase border-b border-amber-500 pb-2">Who We Are</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">The Gentlemen's <br/>Standard</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Luxe Barbers & Co. was founded on a simple principle: men deserve a better grooming experience. We've ditched the rush of the discount chains and the pretentiousness of high-end salons.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                We offer a sanctuary where you can relax, get tailored advice, and leave looking sharper than ever. It's not just a haircut; it's a ritual.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-amber-500 font-bold hover:text-amber-400 transition-colors uppercase tracking-wide text-sm"
              >
                Explore Services <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;