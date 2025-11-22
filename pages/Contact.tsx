import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Info Side */}
          <div className="bg-gray-900 text-white p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-amber-500 font-bold tracking-widest text-xs uppercase mb-2 block">Locate Us</span>
              <h2 className="text-3xl font-serif font-bold mb-8">Get in Touch</h2>
              <p className="text-gray-400 mb-10 leading-relaxed">
                Ready for your transformation? Contact us directly or book online. Walk-ins are welcome based on availability.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg text-amber-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-white">Visit The Shop</h4>
                    <p className="text-gray-400 text-sm">123 Gentleman's Row<br />New York, NY 10012</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg text-amber-500">
                     <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-white">Call Us</h4>
                    <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg text-amber-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-white">Email Us</h4>
                    <p className="text-gray-400 text-sm">bookings@luxebarbers.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Circle */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-600 rounded-full opacity-10 blur-3xl"></div>
          </div>

          {/* Form Side */}
          <div className="p-12 md:w-3/5 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-sm border-b-2 border-gray-200 focus:border-amber-500 outline-none transition-all bg-transparent placeholder-gray-300"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-sm border-b-2 border-gray-200 focus:border-amber-500 outline-none transition-all bg-transparent placeholder-gray-300"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-sm border-b-2 border-gray-200 focus:border-amber-500 outline-none transition-all bg-transparent placeholder-gray-300 resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status !== 'idle'}
                className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  status === 'sent'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 text-white hover:bg-amber-600 hover:text-black'
                }`}
              >
                {status === 'sending' ? (
                  'Sending...'
                ) : status === 'sent' ? (
                  'Message Sent'
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;