import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Stylists from './pages/Stylists';
import Contact from './pages/Contact';
import AITryOn from './pages/AITryOn';
import Booking from './pages/Booking';

const App: React.FC = () => {
  return (
    <BookingProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="stylists" element={<Stylists />} />
            <Route path="contact" element={<Contact />} />
            <Route path="ai-try-on" element={<AITryOn />} />
            <Route path="booking" element={<Booking />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </BookingProvider>
  );
};

export default App;