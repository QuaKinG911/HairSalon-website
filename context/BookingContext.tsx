import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Service } from '../types';

interface BookingContextType {
  cart: Service[];
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  total: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Service[]>(() => {
    const savedCart = localStorage.getItem('bookingCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookingCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (service: Service) => {
    setCart((prev) => {
      // Remove existing item with same ID if present (to allow updating notes)
      const filtered = prev.filter((item) => item.id !== service.id);
      return [...filtered, service];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== serviceId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <BookingContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};