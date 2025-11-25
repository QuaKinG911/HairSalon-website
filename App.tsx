import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import Stylists from './pages/Stylists';
import Contact from './pages/Contact';
import AITryOn from './pages/AITryOn';
import Booking from './pages/Booking';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import BarberDashboard from './pages/barber/Dashboard';
import CustomerBookings from './pages/customer/MyBookings';
import CustomerMessages from './pages/customer/Messages';
import SignUp from './pages/SignUp';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Main Layout Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="stylists" element={<Stylists />} />
              <Route path="contact" element={<Contact />} />
              <Route path="ai-try-on" element={<AITryOn />} />
              <Route path="booking" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Booking />
                </ProtectedRoute>
              } />

              {/* Customer Routes */}
              <Route path="my-bookings" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerBookings />
                </ProtectedRoute>
              } />
              <Route path="messages" element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'barber']}>
                  <CustomerMessages />
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Barber Routes */}
            <Route path="/barber/dashboard" element={
              <ProtectedRoute allowedRoles={['barber']}>
                <BarberDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;