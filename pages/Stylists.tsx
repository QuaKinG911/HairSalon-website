import React, { useState, useEffect } from 'react';
import { STYLISTS } from '../constants';
import { Instagram, Twitter, Mail } from 'lucide-react';
import { Stylist } from '../types';
import { barbersAPI } from '../src/api';

const Stylists: React.FC = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const data = await barbersAPI.getAll();
        // Ensure IDs are strings to match Stylist type
        const formattedBarbers = data.map((b: any) => ({
          ...b,
          id: b.id.toString()
        }));
        setStylists(formattedBarbers);
      } catch (error) {
        console.error('Error fetching barbers:', error);
        setStylists(STYLISTS);
      }
    };

    fetchBarbers();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-2 block">The Crew</span>
          <h1 className="text-5xl font-serif font-bold mb-6 text-white">Master Barbers</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Meet the craftsmen behind the chair. Each of our barbers brings unique expertise and passion to the art of grooming.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="group cursor-pointer bg-gray-800 rounded-sm overflow-hidden shadow-lg flex flex-col h-full hover:shadow-xl transition-all duration-300">
              <div className="relative h-[400px] shrink-0 overflow-hidden">
                <img
                  src={stylist.image}
                  alt={stylist.name}
                  className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <div className="flex justify-center gap-6 text-white">
                    <button className="hover:text-amber-500 transition-colors"><Instagram size={20} /></button>
                    <button className="hover:text-amber-500 transition-colors"><Twitter size={20} /></button>
                    <button className="hover:text-amber-500 transition-colors"><Mail size={20} /></button>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 text-center">
                <div className="h-8 mb-1 flex items-center justify-center">
                  <h3 className="text-2xl font-serif font-bold text-white truncate w-full">{stylist.name}</h3>
                </div>
                <div className="h-4 mb-3 flex items-center justify-center">
                  <p className="text-amber-600 font-bold tracking-widest text-xs uppercase">{stylist.role}</p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{stylist.bio}</p>
                </div>

                {stylist.schedule && (
                  <div className="w-full bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-4 text-left">
                    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2 text-center">Weekly Schedule</p>
                    <div className="text-gray-300 text-xs space-y-1">
                      {(() => {
                        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

                        const formatTime = (timeStr: string) => {
                          if (!timeStr) return '';
                          const [hour, minute] = timeStr.split(':').map(Number);
                          const ampm = hour >= 12 ? 'pm' : 'am';
                          const hour12 = hour % 12 || 12;
                          return `${hour12}:${minute.toString().padStart(2, '0')}${ampm}`;
                        };

                        return daysOfWeek.map((day) => {
                          let startTime = '';
                          let endTime = '';
                          let isActive = false;

                          if (stylist.schedule?.slots && Array.isArray(stylist.schedule.slots)) {
                            const slot = stylist.schedule.slots.find(s => s.day === day);
                            if (slot) {
                              startTime = slot.startTime;
                              endTime = slot.endTime;
                              isActive = slot.isActive;
                            }
                          } else if (stylist.schedule?.days && Array.isArray(stylist.schedule.days)) {
                            isActive = stylist.schedule.days.includes(day);
                            startTime = stylist.schedule.start;
                            endTime = stylist.schedule.end;
                          }

                          return (
                            <div key={day} className="flex justify-between">
                              <span className="text-gray-500 w-20">{day}:</span>
                              <span className={isActive ? 'text-gray-300' : 'text-gray-600 italic'}>
                                {isActive
                                  ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                                  : 'Off'}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {stylist.specialties.map((tech, idx) => (
                    <span key={idx} className="text-[10px] text-gray-400 bg-gray-700 px-2 py-1 rounded-full border border-gray-600">
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