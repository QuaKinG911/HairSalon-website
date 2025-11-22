import React from 'react';
import { STYLISTS } from '../constants';
import { Instagram, Twitter, Mail } from 'lucide-react';

const Stylists: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-2 block">The Crew</span>
          <h1 className="text-5xl font-serif font-bold mb-6 text-gray-900">Master Barbers</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Meet the craftsmen behind the chair. Each of our barbers brings unique expertise and passion to the art of grooming.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {STYLISTS.map((stylist) => (
            <div key={stylist.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-sm mb-6 bg-gray-100 shadow-lg">
                <div className="absolute inset-0 border-4 border-white/10 z-10"></div>
                <img
                  src={stylist.image}
                  alt={stylist.name}
                  className="w-full h-[450px] object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                   <div className="flex justify-center gap-6 text-white">
                     <button className="hover:text-amber-500 transition-colors"><Instagram size={22}/></button>
                     <button className="hover:text-amber-500 transition-colors"><Twitter size={22}/></button>
                     <button className="hover:text-amber-500 transition-colors"><Mail size={22}/></button>
                   </div>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-serif font-bold text-gray-900">{stylist.name}</h3>
                <p className="text-amber-600 font-bold tracking-widest text-xs uppercase">{stylist.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{stylist.bio}</p>
                <div className="pt-4 flex flex-wrap justify-center gap-2">
                  {stylist.specialties.map((tech, idx) => (
                    <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stylists;