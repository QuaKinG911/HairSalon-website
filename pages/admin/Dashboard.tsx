import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, Users, LogOut, Calendar, Scissors, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminServices from './Services';
import AdminBarbers from './Barbers';
import AdminMessages from './Messages';
import AdminBookings from './Bookings';

import { messagesAPI, usersAPI, bookingsAPI, servicesAPI } from '../../src/api';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'services' | 'barbers' | 'messages'>('overview');

    const [stats, setStats] = useState({
        totalBookings: 0,
        totalMessages: 0,
        totalServices: 0,
        totalCustomers: 0,
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [bookings, messages, services, users] = await Promise.all([
                bookingsAPI.getAll(),
                messagesAPI.getMyMessages(),
                servicesAPI.getAll(),
                usersAPI.getAll()
            ]);

            setStats({
                totalBookings: bookings.length,
                totalMessages: messages.filter((m: any) => !m.read).length,
                totalServices: services.length,
                totalCustomers: users.filter((u: any) => u.role === 'customer').length,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold font-serif text-amber-500">Admin Dashboard</h1>
                            <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-200 border border-red-800 rounded-sm hover:bg-red-900 transition-colors"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-gray-700 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === 'overview' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Overview
                            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === 'bookings' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Bookings
                            {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === 'services' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Services
                            {activeTab === 'services' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('barbers')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === 'barbers' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Barbers
                            {activeTab === 'barbers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === 'messages' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            Messages
                            {stats.totalMessages > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {stats.totalMessages}
                                </span>
                            )}
                            {activeTab === 'messages' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Total Bookings</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.totalBookings}</p>
                                    </div>
                                    <div className="p-3 bg-blue-900/30 rounded-lg">
                                        <Calendar className="text-blue-400" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Unread Messages</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.totalMessages}</p>
                                    </div>
                                    <div className="p-3 bg-green-900/30 rounded-lg">
                                        <MessageSquare className="text-green-400" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Total Services</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.totalServices}</p>
                                    </div>
                                    <div className="p-3 bg-purple-900/30 rounded-lg">
                                        <Package className="text-purple-400" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-sm border border-gray-700 p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-wider">Total Customers</p>
                                        <p className="text-3xl font-bold text-white mt-1">{stats.totalCustomers}</p>
                                    </div>
                                    <div className="p-3 bg-amber-900/30 rounded-lg">
                                        <Users className="text-amber-400" size={32} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-bold font-serif text-white mb-4 border-l-4 border-amber-500 pl-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className="bg-gray-800 rounded-sm border border-gray-700 p-6 hover:border-amber-500/50 hover:bg-gray-750 transition-all text-left group"
                                >
                                    <Scissors className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <h3 className="text-lg font-bold text-white mb-2">Manage Services</h3>
                                    <p className="text-sm text-gray-400">Add, edit, or remove salon services</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('barbers')}
                                    className="bg-gray-800 rounded-sm border border-gray-700 p-6 hover:border-amber-500/50 hover:bg-gray-750 transition-all text-left group"
                                >
                                    <Users className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <h3 className="text-lg font-bold text-white mb-2">Manage Barbers</h3>
                                    <p className="text-sm text-gray-400">Update barber profiles and schedules</p>
                                </button>

                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className="bg-gray-800 rounded-sm border border-gray-700 p-6 hover:border-amber-500/50 hover:bg-gray-750 transition-all text-left group"
                                >
                                    <MessageSquare className="text-green-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                    <h3 className="text-lg font-bold text-white mb-2">View Messages</h3>
                                    <p className="text-sm text-gray-400">Read and reply to customer inquiries</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && <AdminServices />}
                {activeTab === 'barbers' && <AdminBarbers />}
                {activeTab === 'messages' && <AdminMessages />}
                {activeTab === 'bookings' && <AdminBookings />}
            </main>
        </div>
    );
};

export default AdminDashboard;
