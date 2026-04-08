import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../src/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('authToken');
        if (token) {
            // Validate token with backend
            authAPI.validate().then(response => {
                setUser(response.user);
            }).catch(() => {
                // Token invalid, clear storage
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }).finally(() => {
                setLoading(false);
            });
        }
        else {
            setLoading(false);
        }
    }, []);
    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            const userData = response.user;
            const token = response.access_token;
            setUser(userData);
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return { success: false, error: message };
        }
    };
    const register = async (email, password, name, phone) => {
        try {
            const response = await authAPI.register(email, password, name, phone);
            const userData = response.user;
            const token = response.access_token;
            setUser(userData);
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            return { success: true, user: userData };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            return { success: false, error: message };
        }
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };
    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: user !== null,
        isAdmin: user?.role === 'admin',
        isBarber: user?.role === 'barber',
        isCustomer: user?.role === 'customer',
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
