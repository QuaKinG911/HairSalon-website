import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Calendar, Clock, CreditCard, CheckCircle, ShieldCheck, Store, Copy, LogIn, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateUniqueBookingNumber } from '../utils/bookingNumber';
import { STYLISTS } from '../constants';
import { Stylist } from '../types';

const Booking: React.FC = () => {
  const { cart, removeFromCart, total, clearCart } = useBooking();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'salon'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [barbers, setBarbers] = useState<Stylist[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');

  // Ensure user is authenticated (route should be protected, but double-check)
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center bg-gray-800">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <LogIn size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400 mb-8 text-lg">Please sign in to book an appointment.</p>
        <Link to="/login" className="px-8 py-3 bg-amber-600 text-black rounded-sm font-bold uppercase tracking-wide hover:bg-amber-500 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load barbers from localStorage, fallback to constants
    const storedBarbers = localStorage.getItem('barbers');
    if (storedBarbers) {
      setBarbers(JSON.parse(storedBarbers));
    } else {
      setBarbers(STYLISTS);
    }
  }, []);

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center bg-gray-800">
        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <Calendar size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 text-lg">Select a grooming service to get started.</p>
        <Link to="/services" className="px-8 py-3 bg-amber-600 text-black rounded-sm font-bold uppercase tracking-wide hover:bg-amber-500 transition-colors">
          View Services
        </Link>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Generate booking number
    const newBookingNumber = generateUniqueBookingNumber();

    // Get selected barber info
    const selectedBarber = barbers.find(b => b.id === selectedBarberId);

    // Create booking object
    const booking = {
      id: `booking-${Date.now()}`,
      bookingNumber: newBookingNumber,
      customerId: user?.id || 'guest',
      customerName,
      customerEmail,
      customerPhone,
      barberId: selectedBarber?.id || 'barber-1',
      barberName: selectedBarber?.name || 'Any Available Barber',
      services: cart.map(s => s.name).join(', '),
      date,
      time,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      status: 'pending',
      total: (total * 1.08).toFixed(2),
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    // Mock API call
    setTimeout(() => {
      setIsProcessing(false);
      setBookingNumber(newBookingNumber);
      setStep(3);
      clearCart();
    }, 2000);
  };

  const copyBookingNumber = () => {
    navigator.clipboard.writeText(bookingNumber);
    alert('Booking number copied to clipboard!');
  };

  return (
    <div className="bg-gray-900 min-h-screen py-12 px-4">
      <div>
        {/* Progress Steps */}
        {step < 3 && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${step >= 1 ? 'bg-amber-600 text-black' : 'bg-gray-700 text-gray-400'}`}>1</div>
              <div className={`w-24 h-1 bg-gray-600 mx-4 rounded ${step >= 2 ? 'bg-amber-500' : ''}`}></div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${step >= 2 ? 'bg-amber-600 text-black' : 'bg-gray-700 text-gray-400'}`}>2</div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white mb-4">Review Services</h2>
              {cart.map((service) => (
                <div key={service.id} className="bg-gray-800 p-6 rounded-sm shadow-sm flex items-center justify-between border border-gray-700">
                  <div className="flex items-center gap-4">
                    <img src={service.image} alt={service.name} className="w-20 h-20 rounded-sm object-cover" />
                    <div>
                      <h3 className="font-bold text-white text-lg">{service.name}</h3>
                      <p className="text-sm text-gray-400 uppercase tracking-wider">{service.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="font-bold text-white text-lg">${service.price}</span>
                    <button
                      onClick={() => removeFromCart(service.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:col-span-1">
              <div className="bg-gray-800 p-8 rounded-sm shadow-lg border-t-4 border-amber-600 sticky top-24">
                <h3 className="font-bold text-white mb-6 text-lg">Order Summary</h3>
                 <div className="space-y-3 mb-6 border-b border-gray-700 pb-6">
                   <div className="flex justify-between text-white">
                     <span>Subtotal</span>
                     <span>${total}</span>
                   </div>
                   <div className="flex justify-between text-white">
                     <span>Tax (Estimated)</span>
                     <span>${(total * 0.08).toFixed(2)}</span>
                   </div>
                 </div>
                 <div className="flex justify-between text-2xl font-serif font-bold text-white mb-8">
                   <span>Total</span>
                   <span>${(total * 1.08).toFixed(2)}</span>
                 </div>

                {/* Date & Time Selection for Step 1 */}
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        min={today}
                        value={date}
                        className="w-full pl-10 pr-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-gray-700 text-white"
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Time</label>
                     <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <select
                           className="w-full pl-10 pr-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-gray-700 text-white"
                           onChange={(e) => setTime(e.target.value)}
                         >
                           <option value="">Choose a slot...</option>
                           <option value="09:00">9:00 AM</option>
                           <option value="10:00">10:00 AM</option>
                           <option value="11:00">11:00 AM</option>
                           <option value="12:00">12:00 PM</option>
                           <option value="13:00">1:00 PM</option>
                           <option value="14:00">2:00 PM</option>
                           <option value="15:00">3:00 PM</option>
                           <option value="16:00">4:00 PM</option>
                           <option value="17:00">5:00 PM</option>
                           <option value="18:00">6:00 PM</option>
                           <option value="19:00">7:00 PM</option>
                           <option value="20:00">8:00 PM</option>
                           <option value="21:00">9:00 PM</option>
                           <option value="22:00">10:00 PM</option>
                           <option value="23:00">11:00 PM</option>
                         </select>
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Barber (Optional)</label>
                     <div className="relative">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <select
                           className="w-full pl-10 pr-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-gray-700 text-white"
                           onChange={(e) => setSelectedBarberId(e.target.value)}
                         >
                           <option value="">Any Available Barber</option>
                           {barbers.map(barber => (
                             <option key={barber.id} value={barber.id}>
                               {barber.name} - {barber.role}
                             </option>
                           ))}
                         </select>
                     </div>
                     <p className="text-xs text-gray-400 mt-1">Leave blank if you have no preference</p>
                   </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!date || !time}
                  className="w-full py-4 bg-gray-900 text-white rounded-sm font-bold uppercase tracking-wider hover:bg-amber-600 hover:text-black disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-700 disabled:text-gray-400 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-sm shadow-xl overflow-hidden">
             <div className="bg-gray-700 text-white p-8 border-b-4 border-amber-600">
              <h2 className="text-2xl font-serif font-bold">Secure Checkout</h2>
              <p className="text-gray-400 text-sm mt-1">Complete your booking for {date} at {time}</p>
            </div>
            <div className="p-8">
               <div className="flex gap-4 mb-8">
                 <button
                   onClick={() => setPaymentMethod('online')}
                   className={`flex-1 py-4 rounded-sm border-2 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${paymentMethod === 'online' ? 'border-amber-600 text-amber-600 bg-gray-800' : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-700'
                     }`}
                 >
                   <CreditCard size={20} /> Pay Online
                 </button>
                 <button
                   onClick={() => setPaymentMethod('salon')}
                   className={`flex-1 py-4 rounded-sm border-2 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${paymentMethod === 'salon' ? 'border-amber-600 text-amber-600 bg-gray-800' : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-700'
                     }`}
                 >
                   <Store size={20} /> Pay in Shop
                 </button>
               </div>

              {paymentMethod === 'online' ? (
                <form onSubmit={handlePayment} className="space-y-6">
                   <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Card Number</label>
                       <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-gray-700 text-white" required />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expiry</label>
                         <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-gray-700 text-white" required />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CVC</label>
                         <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-gray-700 text-white" required />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                       <input type="text" placeholder="Name on card" className="w-full px-4 py-3 rounded-sm border border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-gray-700 text-white" required />
                     </div>
                   </div>

                   <div className="flex items-center gap-2 text-green-400 text-sm bg-gray-800 p-4 rounded-sm border border-gray-700">
                     <ShieldCheck size={18} />
                     <span>Payments are secure and encrypted.</span>
                   </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-amber-600 text-black rounded-sm font-bold uppercase tracking-wider hover:bg-amber-500 transition-all shadow-lg disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isProcessing ? 'Processing...' : `Pay $${(total * 1.08).toFixed(2)}`}
                  </button>
                </form>
              ) : (
                 <div className="text-center space-y-8">
                   <div className="bg-gray-800 p-8 rounded-sm border border-gray-700">
                     <p className="text-gray-400 leading-relaxed">You can pay for your services when you arrive at the shop. We accept cash and all major credit cards.</p>
                   </div>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gray-900 text-white rounded-sm font-bold uppercase tracking-wider hover:bg-amber-600 hover:text-black transition-all shadow-lg"
                  >
                    {isProcessing ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              )}

               <button onClick={() => setStep(1)} className="w-full mt-6 text-gray-400 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                 Back to Details
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
           <div className="max-w-xl mx-auto bg-gray-800 rounded-sm shadow-2xl overflow-hidden text-center">
             <div className="bg-gradient-to-r from-green-600 to-green-700 p-8">
               <div className="w-24 h-24 bg-gray-800 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={48} />
               </div>
               <h2 className="text-3xl font-serif font-bold text-white mb-2">Booking Confirmed!</h2>
               <p className="text-green-100">Your appointment has been successfully booked</p>
             </div>

             <div className="p-8">
               {/* Booking Number */}
               <div className="bg-gray-700 border-2 border-amber-600 rounded-lg p-6 mb-6">
                 <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Your Booking Number</p>
                 <div className="flex items-center justify-center gap-3">
                   <span className="text-4xl font-bold text-amber-400 tracking-wider">{bookingNumber}</span>
                   <button
                     onClick={copyBookingNumber}
                     className="p-2 hover:bg-gray-600 rounded transition-colors"
                     title="Copy booking number"
                   >
                     <Copy size={20} className="text-amber-400" />
                   </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-3">
                   Please save this number. You'll need it when you arrive at the shop.
                 </p>
               </div>

               {/* Booking Details */}
               <div className="bg-gray-700 rounded-lg p-6 mb-6 text-left">
                 <h3 className="font-bold text-white mb-4">Appointment Details</h3>
                 <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-400">Date:</span>
                     <span className="font-medium text-white">{new Date(date).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Time:</span>
                     <span className="font-medium text-white">{time}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Payment:</span>
                     <span className="font-medium text-white">
                       {paymentMethod === 'online' ? 'Paid Online' : 'Pay in Shop'}
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Total:</span>
                     <span className="font-bold text-white">${(total * 1.08).toFixed(2)}</span>
                   </div>
                 </div>
               </div>

               <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                 A confirmation email has been sent to {customerEmail}. We look forward to refining your look!
               </p>

               <div className="flex gap-3">
                 <Link
                   to="/my-bookings"
                   className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-sm font-bold uppercase tracking-wider hover:bg-amber-600 hover:text-black transition-colors"
                 >
                   View My Bookings
                 </Link>
                 <Link
                   to="/"
                   className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-sm font-bold uppercase tracking-wider hover:border-gray-500 transition-colors"
                 >
                   Return Home
                 </Link>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default Booking;