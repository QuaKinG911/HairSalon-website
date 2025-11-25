import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Scissors, Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, MessageSquare, Bell } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { messagesAPI } from '../src/api';

const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, user]);

  const fetchUnreadCount = async () => {
    try {
      // Only fetch if we have a token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const messages = await messagesAPI.getMyMessages();
      const unread = messages.filter(m => !m.read && m.recipient_id === user?.id).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      // Don't spam console if token is invalid, just reset count
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'barber':
        return '/barber/dashboard';
      case 'customer':
        return '/my-bookings';
      default:
        return '/';
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-sm hover:bg-amber-600 transition-colors text-sm font-bold"
      >
        <User size={18} />
        Login
      </Link>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        to={getDashboardLink()}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors text-sm"
      >
        <LayoutDashboard size={18} />
        <span className="font-medium">{user.name}</span>
      </Link>
      <Link
        to="/messages"
        className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors text-sm"
      >
        <Bell size={18} />
        Messages
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Link>
      <button
        onClick={handleLogout}
        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cart } = useBooking();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Barbers', path: '/stylists' },
    { name: 'AI Consultant', path: '/ai-try-on' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-gray-800/95 backdrop-blur-md shadow-sm border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gray-900 text-amber-500 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <Scissors size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-tight text-white leading-none">Luxe Barber</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-amber-600 ${isActive(link.path) ? 'text-amber-600' : 'text-gray-400'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                to="/booking"
                className="relative p-2 text-gray-400 hover:text-amber-600 transition-colors"
                aria-label="Booking Cart"
              >
                <ShoppingBag size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-amber-600 rounded-full">
                    {cart.length}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-bold ${isActive(link.path)
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-400 hover:text-amber-600 hover:bg-gray-800'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-12 border-t-4 border-amber-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scissors size={20} className="text-amber-500" />
                 <span className="text-xl font-serif font-bold">Luxe Barber</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Refining the modern gentleman through exceptional grooming experiences and cutting-edge technology.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-amber-500">Location</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>123 Gentleman's Row</li>
                <li>New York, NY 10012</li>
                <li className="text-white mt-2">+1 (555) 123-4567</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-amber-500">Hours</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex justify-between border-b border-gray-800 pb-1"><span>Mon - Fri</span> <span>10:00 AM - 8:00 PM</span></li>
                <li className="flex justify-between border-b border-gray-800 pb-1 pt-1"><span>Saturday</span> <span>9:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between pt-1"><span>Sunday</span> <span>11:00 AM - 4:00 PM</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Luxe Barber All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;