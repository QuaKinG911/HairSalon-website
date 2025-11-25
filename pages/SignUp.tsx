import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignUp: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Validation
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                setLoading(false);
                return;
            }

            // Register user
            const result = await register(formData.email, formData.password, formData.name, formData.phone);

            if (result.success) {
                setSuccess('Account created successfully! Redirecting...');

                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(result.error || 'An error occurred during registration.');
            }

        } catch (err) {
            setError('An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-4">
                        <UserPlus className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Join Luxe Barber</p>
                </div>

                {/* Sign Up Form */}
                <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-900/30 border border-red-800 rounded-sm p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-300 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-900/30 border border-green-800 rounded-sm p-4 flex items-start gap-3">
                                <CheckCircle className="text-green-300 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-green-300">{success}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

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
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-300 mb-2">
                                Phone Number (Optional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                    placeholder="+1 (555) 123-4567"
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
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-amber-600 hover:text-amber-500 font-bold transition-colors"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;