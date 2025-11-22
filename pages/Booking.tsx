import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Trash2, Calendar, Clock, CreditCard, CheckCircle, ShieldCheck, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Booking: React.FC = () => {
  const { cart, removeFromCart, total, clearCart } = useBooking();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Cart, 2: Date/Time, 3: Payment
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'salon'>('online');
  const [isProcessing, setIsProcessing] = useState(false);

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <Calendar size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-lg">Select a grooming service to get started.</p>
        <Link to="/services" className="px-8 py-3 bg-amber-600 text-black rounded-sm font-bold uppercase tracking-wide hover:bg-amber-500 transition-colors">
          View Services
        </Link>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Mock API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      clearCart();
    }, 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Progress Steps */}
        {step < 3 && (
           <div className="flex justify-center mb-12">
             <div className="flex items-center">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
               <div className={`w-24 h-1 bg-gray-300 mx-4 rounded ${step >= 2 ? 'bg-amber-500' : ''}`}></div>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
             </div>
           </div>
        )}

        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Review Services</h2>
              {cart.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-sm shadow-sm flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-4">
                    <img src={service.image} alt={service.name} className="w-20 h-20 rounded-sm object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                      <p className="text-sm text-gray-500 uppercase tracking-wider">{service.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="font-bold text-gray-900 text-lg">${service.price}</span>
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
              <div className="bg-white p-8 rounded-sm shadow-lg border-t-4 border-amber-600 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Summary</h3>
                <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (Estimated)</span>
                    <span>${(total * 0.08).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-2xl font-serif font-bold text-gray-900 mb-8">
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
                         className="w-full pl-10 pr-4 py-3 rounded-sm border border-gray-200 focus:border-amber-500 outline-none bg-gray-50"
                         onChange={(e) => setDate(e.target.value)}
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Time</label>
                     <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <select 
                         className="w-full pl-10 pr-4 py-3 rounded-sm border border-gray-200 focus:border-amber-500 outline-none appearance-none bg-gray-50"
                         onChange={(e) => setTime(e.target.value)}
                       >
                         <option value="">Choose a slot...</option>
                         <option value="09:00">9:00 AM</option>
                         <option value="10:00">10:00 AM</option>
                         <option value="11:00">11:00 AM</option>
                         <option value="13:00">1:00 PM</option>
                         <option value="14:00">2:00 PM</option>
                         <option value="15:00">3:00 PM</option>
                         <option value="16:00">4:00 PM</option>
                         <option value="17:00">5:00 PM</option>
                       </select>
                     </div>
                   </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!date || !time}
                  className="w-full py-4 bg-gray-900 text-white rounded-sm font-bold uppercase tracking-wider hover:bg-amber-600 hover:text-black disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300 disabled:hover:text-white transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
           <div className="max-w-2xl mx-auto bg-white rounded-sm shadow-xl overflow-hidden">
              <div className="bg-gray-900 text-white p-8 border-b-4 border-amber-600">
                <h2 className="text-2xl font-serif font-bold">Secure Checkout</h2>
                <p className="text-gray-400 text-sm mt-1">Complete your booking for {date} at {time}</p>
              </div>
              <div className="p-8">
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`flex-1 py-4 rounded-sm border-2 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'online' ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <CreditCard size={20} /> Pay Online
                  </button>
                  <button
                    onClick={() => setPaymentMethod('salon')}
                    className={`flex-1 py-4 rounded-sm border-2 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'salon' ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <Store size={20} /> Pay in Shop
                  </button>
                </div>

                {paymentMethod === 'online' ? (
                   <form onSubmit={handlePayment} className="space-y-6">
                     <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                         <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:border-amber-500 outline-none" required />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry</label>
                            <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:border-amber-500 outline-none" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVC</label>
                            <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:border-amber-500 outline-none" required />
                          </div>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                         <input type="text" placeholder="Name on card" className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:border-amber-500 outline-none" required />
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-4 rounded-sm border border-green-100">
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
                    <div className="bg-gray-50 p-8 rounded-sm border border-gray-200">
                      <p className="text-gray-600 leading-relaxed">You can pay for your services when you arrive at the shop. We accept cash and all major credit cards.</p>
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
                
                <button onClick={() => setStep(1)} className="w-full mt-6 text-gray-400 text-sm font-bold uppercase tracking-wider hover:text-gray-900 transition-colors">
                   Back to Details
                </button>
              </div>
           </div>
        )}

        {step === 3 && (
          <div className="max-w-xl mx-auto bg-white rounded-sm shadow-2xl overflow-hidden p-16 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Booking Confirmed</h2>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Your appointment is set. We have sent a confirmation email with all the details. We look forward to refining your look.
            </p>
            <Link to="/" className="px-10 py-4 bg-gray-900 text-white rounded-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;