import React, { useState } from 'react';
import { SERVICES } from '../constants';
import { useBooking } from '../context/BookingContext';
import { Check, Plus, Scissors } from 'lucide-react';

const Services: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const { addToCart, cart } = useBooking();

  const categories = ['All', 'Haircuts', 'Beard & Shave', 'Grooming', 'Packages'];

  const filteredServices = filter === 'All'
    ? SERVICES
    : SERVICES.filter(service => service.category === filter);

  const isInCart = (id: string) => cart.some(item => item.id === id);

  return (
    <div className="bg-gray-900 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-6 text-white">Grooming Menu</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Select from our range of premium services designed to keep you looking your absolute best.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-sm text-sm font-bold tracking-wider uppercase transition-all ${filter === cat
                ? 'bg-gray-900 text-amber-500 border border-gray-700'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-gray-800 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
              <div className="h-64 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <span className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-wider bg-amber-600 px-3 py-1 rounded-sm">
                  {service.category}
                </span>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-3 flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white font-serif w-2/3">{service.name}</h3>
                  <span className="text-xl font-bold text-amber-600">${service.price}</span>
                </div>
                <div className="mb-6">
                  <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => addToCart(service)}
                    disabled={isInCart(service.id)}
                    className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${isInCart(service.id)
                      ? 'bg-gray-700 text-gray-400 cursor-default'
                      : 'bg-gray-900 text-white hover:bg-amber-600 hover:text-black'
                      }`}
                  >
                    {isInCart(service.id) ? (
                      <>
                        <Check size={16} /> Selected
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Book Service
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;