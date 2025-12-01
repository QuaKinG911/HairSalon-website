import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CreditCard, Package, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { bookingsAPI } from '../../src/api';

interface Booking {
    id: string;
    bookingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    services: string;
    date: string;
    time: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    total: string;
    createdAt: string;
}

const MyBookings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                const data = await bookingsAPI.getByCustomer(user.id.toString());

                // Map API response (snake_case) to frontend interface (camelCase)
                const mappedBookings = data.map((b: any) => ({
                    id: b.id.toString(),
                    bookingNumber: b.booking_number,
                    customerName: b.customer_name,
                    customerEmail: b.customer_email,
                    customerPhone: b.customer_phone,
                    services: Array.isArray(b.services) ? b.services.join(', ') : b.services,
                    date: b.date,
                    time: b.time,
                    paymentMethod: b.payment_method,
                    paymentStatus: b.payment_status,
                    status: b.status,
                    total: b.total,
                    createdAt: b.created_at
                }));

                // Sort by date (newest first)
                mappedBookings.sort((a: Booking, b: Booking) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setBookings(mappedBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const copyBookingNumber = (number: string) => {
        navigator.clipboard.writeText(number);
        alert('Booking number copied!');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-900/30 text-green-300';
            case 'completed':
                return 'bg-blue-900/30 text-blue-300';
            case 'cancelled':
                return 'bg-red-900/30 text-red-300';
            default:
                return 'bg-amber-900/30 text-amber-300';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Home
                </button>

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-amber-600" size={32} />
                            <div>
                                <h1 className="text-3xl font-bold text-white">My Bookings</h1>
                                <p className="text-gray-400 text-sm mt-1">View and manage your appointments</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                                <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                                <p className="text-gray-400 mb-6">You haven't made any appointments yet.</p>
                                <button
                                    onClick={() => navigate('/services')}
                                    className="px-6 py-3 bg-amber-600 text-white rounded-sm font-bold hover:bg-amber-500 transition-colors"
                                >
                                    Browse Services
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-white">
                                                        Booking #{booking.bookingNumber}
                                                    </h3>
                                                    <button
                                                        onClick={() => copyBookingNumber(booking.bookingNumber)}
                                                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                                                        title="Copy booking number"
                                                    >
                                                        <Copy size={16} className="text-gray-400" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <Calendar className="text-gray-400 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Date & Time</p>
                                                    <p className="font-medium text-white">
                                                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Package className="text-gray-400 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Services</p>
                                                    <p className="font-medium text-white">{booking.services}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <CreditCard className="text-gray-400 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Payment</p>
                                                    <p className="font-medium text-white">
                                                        {booking.paymentMethod === 'online' ? 'Paid Online' : 'Pay in Shop'}
                                                        {booking.paymentStatus === 'paid' && (
                                                            <span className="ml-2 text-green-600 text-xs">✓ Paid</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Clock className="text-gray-400 mt-1" size={18} />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                                                    <p className="font-bold text-white text-lg">${booking.total}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.status === 'pending' && (
                                            <div className="mt-4 flex justify-between items-center bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
                                                <span><strong>Reminder:</strong> Please arrive 10 minutes early.</span>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                                                            try {
                                                                await bookingsAPI.delete(booking.id);
                                                                setBookings(prev => prev.filter(b => b.id !== booking.id));
                                                                alert('Booking cancelled successfully.');
                                                            } catch (error) {
                                                                console.error('Error cancelling booking:', error);
                                                                alert('Failed to cancel booking.');
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Cancel Booking
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
