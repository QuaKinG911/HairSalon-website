import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CreditCard, Package, Search, Trash2, CheckCircle, XCircle, User } from 'lucide-react';
import { bookingsAPI } from '../../src/api';

interface Booking {
    id: string;
    bookingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    barberName: string;
    services: string;
    date: string;
    time: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    total: string;
    createdAt: string;
}

const AdminBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const data = await bookingsAPI.getAll();

            // Map API response (snake_case) to frontend interface (camelCase)
            const mappedBookings = data.map((b: any) => ({
                id: b.id.toString(),
                bookingNumber: b.booking_number,
                customerName: b.customer_name,
                customerEmail: b.customer_email,
                customerPhone: b.customer_phone,
                barberName: b.barber_name,
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

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await bookingsAPI.updateStatus(id, newStatus);
            setBookings(prev => prev.map(b =>
                b.id === id ? { ...b, status: newStatus } : b
            ));
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            return;
        }

        try {
            await bookingsAPI.delete(id);
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Failed to delete booking');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-900/30 text-green-400 border-green-800';
            case 'completed':
                return 'bg-blue-900/30 text-blue-400 border-blue-800';
            case 'cancelled':
                return 'bg-red-900/30 text-red-400 border-red-800';
            default:
                return 'bg-amber-900/30 text-amber-400 border-amber-800';
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-serif text-white">Manage Bookings</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white w-64"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-gray-800 rounded-sm border border-gray-700 p-12 text-center">
                    <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
                    <p className="text-gray-400">There are no bookings matching your search.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-gray-800 border border-gray-700 rounded-sm p-6 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">
                                            #{booking.bookingNumber || 'N/A'}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <User size={14} />
                                        <span className="text-white font-medium">{booking.customerName}</span>
                                        <span className="text-gray-600">•</span>
                                        <span>{booking.customerEmail}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {booking.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-800 rounded hover:bg-green-900/50 transition-colors text-sm font-bold"
                                        >
                                            <CheckCircle size={14} /> Confirm
                                        </button>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/30 text-blue-400 border border-blue-800 rounded hover:bg-blue-900/50 transition-colors text-sm font-bold"
                                        >
                                            <CheckCircle size={14} /> Complete
                                        </button>
                                    )}
                                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800 rounded hover:bg-red-900/50 transition-colors text-sm font-bold"
                                        >
                                            <XCircle size={14} /> Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(booking.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                        title="Delete Booking"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-900/50 p-4 rounded-sm border border-gray-700/50">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Calendar size={14} className="text-amber-500" />
                                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300 mt-1">
                                        <Clock size={14} className="text-amber-500" />
                                        <span>{booking.time}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Barber</p>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <User size={14} className="text-amber-500" />
                                        <span>{booking.barberName || 'Any Available'}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Services</p>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Package size={14} className="text-amber-500" />
                                        <span className="truncate" title={booking.services}>{booking.services}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <CreditCard size={14} className="text-amber-500" />
                                        <span>{booking.paymentMethod === 'online' ? 'Paid Online' : 'Pay in Shop'}</span>
                                    </div>
                                    <p className="font-bold text-white mt-1">${booking.total}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
