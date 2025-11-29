import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authenticateUser } from '../utils/auth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success && result.user) {
                // Redirect based on role
                switch (result.user.role) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'barber':
                        navigate('/barber/dashboard');
                        break;
                    case 'customer':
                        navigate('/');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                setError(result.error || 'Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemoCredentials = (role: 'admin' | 'barber' | 'customer') => {
        switch (role) {
            case 'admin':
                setEmail('admin@hairsalon.com');
                setPassword('password');
                break;
            case 'barber':
                setEmail('barber@hairsalon.com');
                setPassword('password');
                break;
            case 'customer':
                setEmail('customer@example.com');
                setPassword('password');
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-sm p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-amber-600 text-white font-bold rounded-sm hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>



                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/signup')}
                                className="text-amber-600 hover:text-amber-500 font-bold transition-colors"
                            >
                                Sign Up
                            </button>
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
