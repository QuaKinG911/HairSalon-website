import React, { createContext, useState, useContext, useEffect } from 'react';
const BookingContext = createContext(undefined);
export const BookingProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('bookingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    useEffect(() => {
        localStorage.setItem('bookingCart', JSON.stringify(cart));
    }, [cart]);
    const addToCart = (service) => {
        setCart((prev) => {
            // Remove existing item with same ID if present (to allow updating notes)
            const filtered = prev.filter((item) => item.id !== service.id);
            return [...filtered, service];
        });
    };
    const removeFromCart = (serviceId) => {
        setCart((prev) => prev.filter((item) => item.id !== serviceId));
    };
    const clearCart = () => {
        setCart([]);
    };
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    return (<BookingContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </BookingContext.Provider>);
};
export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
