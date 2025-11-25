import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../src/api';

interface User {
    id: string;
    email: string;
    role: 'admin' | 'barber' | 'customer';
    name: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isBarber: boolean;
    isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
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
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login(email, password);
            const { user: userData, token } = response;

            setUser(userData);
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (email: string, password: string, name: string, phone?: string) => {
        try {
            const response = await authAPI.register(email, password, name, phone);
            const { user: userData, token } = response;

            setUser(userData);
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));

            return { success: true, user: userData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };

    const value: AuthContextType = {
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
