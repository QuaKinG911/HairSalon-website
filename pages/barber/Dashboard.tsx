import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, Search, Package, CreditCard, User as UserIcon, Phone, Mail, MessageSquare, LayoutDashboard, ChevronRight, CheckCircle, XCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Messenger from '../../components/Messenger';

import { messagesAPI, usersAPI, barbersAPI, bookingsAPI } from '../../src/api';
import { Message, User } from '../../types';

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

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
    senderId: number;
}

interface ScheduleSlot {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

const BarberDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const activeTabState = useState<'overview' | 'bookings' | 'messages' | 'schedule'>('overview');
    const activeTab = activeTabState[0];
    const setActiveTab = activeTabState[1];

    // Data states
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);

    // Search states
    const [searchNumber, setSearchNumber] = useState('');
    const [searchResult, setSearchResult] = useState<Booking | null>(null);
    const [searchError, setSearchError] = useState('');

    // Message states
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    // Schedule states
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);
    const [scheduleMessage, setScheduleMessage] = useState('');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        loadData();
        loadSchedule();
    }, []);

    const loadData = async () => {
        // Load Bookings
        try {
            const data = await bookingsAPI.getAll();
            const allBookings = data.map((b: any) => ({
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

            allBookings.sort((a: Booking, b: Booking) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setBookings(allBookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
        }

        // Load Messages from API
        try {
            const [msgs, users] = await Promise.all([
                messagesAPI.getMyMessages(),
                usersAPI.getAll()
            ]);

            const formattedMessages = msgs.map((m: Message) => {
                const sender = users.find((u: User) => u.id === m.sender_id);
                return {
                    id: m.id,
                    name: sender?.name || 'Unknown',
                    email: sender?.email || 'Unknown',
                    subject: m.subject,
                    message: m.content,
                    createdAt: m.created_at,
                    read: m.read,
                    senderId: m.sender_id
                };
            });

            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const loadSchedule = async () => {
        try {
            // Try to load from API first
            const barbers = await barbersAPI.getAll();
            const myBarberProfile = barbers.find((b: any) => b.name === user?.name);

            if (myBarberProfile && myBarberProfile.schedule) {
                const apiSchedule = myBarberProfile.schedule;

                if (apiSchedule.slots) {
                    // Load detailed slots
                    const loadedSchedule: ScheduleSlot[] = apiSchedule.slots.map((slot: any) => ({
                        id: `${slot.day.toLowerCase()}-${Date.now()}-${Math.random()}`,
                        day: slot.day,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        isActive: slot.isActive
                    }));
                    setSchedule(loadedSchedule);
                    return;
                }

                // Fallback: Convert old API format { days, start, end } to Dashboard format
                const loadedSchedule: ScheduleSlot[] = days.map(day => {
                    const isActive = apiSchedule.days.includes(day);
                    return {
                        id: `${day.toLowerCase()}-${Date.now()}`,
                        day,
                        startTime: isActive ? apiSchedule.start : '09:00',
                        endTime: isActive ? apiSchedule.end : '17:00',
                        isActive
                    };
                });
                setSchedule(loadedSchedule);
                return;
            }
        } catch (error) {
            console.error('Error loading schedule from API:', error);
        }

        // Fallback to local storage or default
        const savedSchedule = localStorage.getItem(`barber_schedule_${user?.id}`);
        if (savedSchedule) {
            setSchedule(JSON.parse(savedSchedule));
        } else {
            // Initialize default schedule
            const defaultSchedule: ScheduleSlot[] = days.map(day => ({
                id: `${day.toLowerCase()}-${Date.now()}`,
                day,
                startTime: '09:00',
                endTime: '17:00',
                isActive: day !== 'Sunday' // Default: work Mon-Sat
            }));
            setSchedule(defaultSchedule);
        }
    };

    const saveSchedule = async () => {
        try {
            // Format schedule for API
            // The API expects { days: string[], start: string, end: string }
            // But our UI allows per-day schedules.
            // For now, let's find the most common start/end time or just take the first active day's times
            // and list all active days.
            // A better approach would be to update the backend to support per-day schedules,
            // but to stick to the current schema:

            const activeSlots = schedule.filter(s => s.isActive);
            const days = activeSlots.map(s => s.day);
            const start = activeSlots.length > 0 ? activeSlots[0].startTime : '09:00';
            const end = activeSlots.length > 0 ? activeSlots[0].endTime : '17:00';

            const scheduleData = {
                days,
                start,
                end,
                slots: schedule.map(s => ({
                    day: s.day,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isActive: s.isActive
                }))
            };

            // We need the barber's ID. Assuming the logged-in user is the barber and their ID matches the barber ID.
            // In a real app, we'd have a link between User and Barber.
            // For this demo, let's assume the user.id corresponds to the barber.id if the user is a barber.
            // However, looking at the seed data:
            // User 2 is Marcus (Barber 1)
            // User 3 is Jax (Barber 2)
            // User 4 is Leo (Barber 3)
            // So User ID = Barber ID + 1.
            // This is fragile. Let's try to find the barber by name or email if possible, or just use a mapping.
            // Let's try to fetch the barber details first to match.

            // Actually, let's just try to update the barber with ID = user.id - 1 for now as a hack,
            // or better, let's fetch all barbers and find the one with the same name as the user.

            const barbers = await barbersAPI.getAll();
            console.log('All barbers:', barbers);
            console.log('Current user:', user);
            const myBarberProfile = barbers.find((b: any) => b.name === user?.name);
            console.log('Found barber profile:', myBarberProfile);

            if (myBarberProfile) {
                console.log('Updating barber schedule...', myBarberProfile.id, scheduleData);
                await barbersAPI.update(myBarberProfile.id, {
                    ...myBarberProfile,
                    schedule: scheduleData
                });
                console.log('Schedule updated successfully');
                setScheduleMessage('Schedule saved successfully!');
            } else {
                console.error('Barber profile not found for user:', user?.name);
                setScheduleMessage('Error: Barber profile not found.');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            setScheduleMessage('Failed to save schedule.');
        }

        // Keep local storage sync for backup/offline (optional, but good for now)
        localStorage.setItem(`barber_schedule_${user?.id}`, JSON.stringify(schedule));

        setIsEditingSchedule(false);
        setTimeout(() => setScheduleMessage(''), 3000);
    };

    const updateSlot = (id: string, updates: Partial<ScheduleSlot>) => {
        setSchedule(prev => prev.map(slot =>
            slot.id === id ? { ...slot, ...updates } : slot
        ));
    };

    const getTodaySchedule = () => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return schedule.find(slot => slot.day.toLowerCase() === today);
    };

    const getWorkingDays = () => {
        return schedule.filter(slot => slot.isActive);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchError('');
        setSearchResult(null);

        if (!searchNumber || searchNumber.length !== 6) {
            setSearchError('Please enter a valid 6-digit booking number');
            return;
        }

        const booking = bookings.find(b => b.bookingNumber === searchNumber);
        if (booking) {
            setSearchResult(booking);
        } else {
            setSearchError('No booking found with this number');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getTodayBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter(b => b.date === today);
    };

    const getUpcomingBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter(b => b.date > today).slice(0, 5);
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

    const markAsRead = async (id: string) => {
        try {
            await messagesAPI.markAsRead(id);
            // Update local state
            setMessages(prev => prev.map(m =>
                m.id === id ? { ...m, read: true } : m
            ));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleSelectMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        if (!message.read) {
            markAsRead(message.id);
        }
    };

    const BookingCard: React.FC<{ booking: Booking; highlight?: boolean }> = ({ booking, highlight }) => (
        <div className={`border rounded-sm p-4 transition-all ${highlight ? 'border-amber-500 bg-amber-900/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-white">#{booking.bookingNumber}</h4>
                    <p className="text-sm text-gray-400">{booking.customerName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-amber-500" />
                    <span className="text-gray-300">{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-500" />
                    <span className="text-gray-300">{booking.time}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Package size={14} className="text-amber-500" />
                    <span className="text-gray-300 truncate">{booking.services}</span>
                </div>
                <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-amber-500" />
                    <span className="text-gray-300">
                        {booking.paymentStatus === 'paid' ? '✓ Paid' : 'Pay in Shop'}
                    </span>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-700 text-sm space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={14} />
                    <span>{booking.customerPhone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{booking.customerEmail}</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-sm font-bold text-amber-500">Total: ${booking.total}</p>
            </div>
        </div>
    );

    const todaySlot = getTodaySchedule();
    const workingDays = getWorkingDays();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold font-serif text-amber-500">Barber Dashboard</h1>
                            <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-200 border border-red-800 rounded-sm hover:bg-red-900 transition-colors"
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'overview' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Overview
                            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'bookings' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Bookings
                            {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'schedule' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Schedule
                            {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === 'messages' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Messages
                            {messages.some(m => !m.read) && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {messages.filter(m => !m.read).length}
                                </span>
                            )}
                            {activeTab === 'messages' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Today's Bookings</p>
                                        <p className="text-3xl font-bold text-white mt-1">{getTodayBookings().length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-900/30 rounded-lg">
                                        <Calendar className="text-blue-400" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Total Bookings</p>
                                        <p className="text-3xl font-bold text-white mt-1">{bookings.length}</p>
                                    </div>
                                    <div className="p-3 bg-green-900/30 rounded-lg">
                                        <Package className="text-green-400" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Upcoming</p>
                                        <p className="text-3xl font-bold text-white mt-1">{getUpcomingBookings().length}</p>
                                    </div>
                                    <div className="p-3 bg-purple-900/30 rounded-lg">
                                        <Clock className="text-purple-400" size={32} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Bookings */}
                        <div>
                            <h2 className="text-xl font-bold font-serif text-white mb-4 border-l-4 border-amber-500 pl-4">Today's Appointments</h2>
                            {getTodayBookings().length === 0 ? (
                                <div className="bg-gray-800 rounded-sm border border-gray-700 p-8 text-center">
                                    <Calendar className="mx-auto text-gray-600 mb-3" size={48} />
                                    <p className="text-gray-400">No appointments for today</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getTodayBookings().map(booking => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold font-serif text-white mb-4 border-l-4 border-amber-500 pl-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className="bg-gray-800 rounded-sm border border-gray-700 p-6 hover:border-amber-500/50 hover:bg-gray-750 transition-all text-left group"
                                >
                                    <Clock className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <h3 className="text-lg font-bold text-white mb-2">Manage Schedule</h3>
                                    <p className="text-sm text-gray-400">Set your working hours and availability</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className="bg-gray-800 rounded-sm border border-gray-700 p-6 hover:border-amber-500/50 hover:bg-gray-750 transition-all text-left group"
                                >
                                    <Search className="text-amber-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <h3 className="text-lg font-bold text-white mb-2">Find Booking</h3>
                                    <p className="text-sm text-gray-400">Search for a specific booking number</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                    <div className="space-y-8">
                        {/* Search */}
                        <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                            <h2 className="text-xl font-bold font-serif text-white mb-4">Search Booking</h2>
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        type="text"
                                        value={searchNumber}
                                        onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Enter 6-digit booking number"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500"
                                        maxLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-amber-600 text-black rounded-sm font-bold hover:bg-amber-500 transition-colors uppercase tracking-wide"
                                >
                                    Search
                                </button>
                            </form>

                            {searchError && (
                                <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-sm text-red-400 text-sm">
                                    {searchError}
                                </div>
                            )}

                            {searchResult && (
                                <div className="mt-6">
                                    <h3 className="font-bold text-white mb-3">Search Result:</h3>
                                    <BookingCard booking={searchResult} highlight />
                                </div>
                            )}
                        </div>

                        {/* All Bookings List */}
                        <div>
                            <h2 className="text-xl font-bold font-serif text-white mb-4 border-l-4 border-amber-500 pl-4">All Appointments</h2>
                            {bookings.length === 0 ? (
                                <p className="text-gray-400">No bookings found.</p>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {bookings.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SCHEDULE TAB */}
                {activeTab === 'schedule' && (
                    <div className="space-y-8">
                        {/* Today's Schedule */}
                        <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-amber-500" size={24} />
                                    <h2 className="text-xl font-bold font-serif text-white">Today's Schedule</h2>
                                </div>
                                <div className="flex gap-3">
                                    {scheduleMessage && (
                                        <div className="flex items-center gap-2 text-green-400 font-medium">
                                            <CheckCircle size={20} />
                                            {scheduleMessage}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                                        className={`px-4 py-2 rounded-sm font-bold transition-colors ${isEditingSchedule
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-amber-600 text-black hover:bg-amber-500'
                                            }`}
                                    >
                                        {isEditingSchedule ? 'Cancel' : 'Edit Schedule'}
                                    </button>
                                    {isEditingSchedule && (
                                        <button
                                            onClick={saveSchedule}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-sm font-bold hover:bg-green-500 transition-colors"
                                        >
                                            <Save size={18} />
                                            Save Changes
                                        </button>
                                    )}
                                </div>
                            </div>
                            {todaySlot ? (
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${todaySlot.isActive ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'
                                        }`}>
                                        {todaySlot.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        {todaySlot.isActive ? 'Working' : 'Off'}
                                    </div>
                                    {todaySlot.isActive && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={16} />
                                            <span>{todaySlot.startTime} - {todaySlot.endTime}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No schedule set for today</p>
                            )}
                        </div>

                        {/* Weekly Schedule */}
                        <div className="bg-gray-800 rounded-sm border border-gray-700 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
                                <h1 className="text-3xl font-bold font-serif text-white">Weekly Schedule</h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Manage your working hours and availability
                                </p>
                            </div>

                            <div className="p-8">
                                <div className="grid gap-4">
                                    {schedule.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className={`border rounded-sm p-6 transition-all ${slot.isActive ? 'border-green-900/50 bg-green-900/10' : 'border-gray-700 bg-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-white">{slot.day}</h3>
                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${slot.isActive ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'
                                                        }`}>
                                                        {slot.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                        {slot.isActive ? 'Working' : 'Off'}
                                                    </div>
                                                </div>

                                                {isEditingSchedule && (
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.isActive}
                                                            onChange={(e) => updateSlot(slot.id, { isActive: e.target.checked })}
                                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 bg-gray-700 border-gray-600"
                                                        />
                                                        <span className="text-sm font-medium text-gray-300">
                                                            {slot.isActive ? 'Working' : 'Off'}
                                                        </span>
                                                    </label>
                                                )}
                                            </div>

                                            {slot.isActive && (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-400 mb-2">
                                                            Start Time
                                                        </label>
                                                        {isEditingSchedule ? (
                                                            <input
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-sm">
                                                                <Clock size={16} className="text-gray-400" />
                                                                <span className="text-gray-200">{slot.startTime}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-400 mb-2">
                                                            End Time
                                                        </label>
                                                        {isEditingSchedule ? (
                                                            <input
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-sm">
                                                                <Clock size={16} className="text-gray-400" />
                                                                <span className="text-gray-200">{slot.endTime}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="mt-8 p-6 bg-gray-700/30 rounded-sm border border-gray-700">
                                    <h3 className="text-lg font-bold text-white mb-3">Schedule Summary</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Working Days</p>
                                            <p className="font-bold text-white">{workingDays.length} days</p>
                                            <p className="text-xs text-gray-500">
                                                {workingDays.map(day => day.day.slice(0, 3)).join(', ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Typical Hours</p>
                                            <p className="font-bold text-white">
                                                {workingDays.length > 0 ? `${workingDays[0].startTime} - ${workingDays[0].endTime}` : 'Not set'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {workingDays.length > 0 && workingDays.every(day => day.startTime === workingDays[0].startTime && day.endTime === workingDays[0].endTime)
                                                    ? 'Same hours every day'
                                                    : 'Varies by day'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MESSAGES TAB */}
                {activeTab === 'messages' && (
                    <Messenger className="h-[600px]" />
                )}
            </main>
        </div>
    );
};

export default BarberDashboard;
