import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { messagesAPI } from '../src/api';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';

const Notifications: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchMessages();
            // Poll for new messages every minute
            const interval = setInterval(fetchMessages, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await messagesAPI.getMyMessages();
            // Filter messages for the current user (recipient)
            const myMessages = data.filter((m: any) => m.recipient_id === user?.id);
            // Sort by date desc
            myMessages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setMessages(myMessages);
            setUnreadCount(myMessages.filter((m: any) => !m.read).length);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await messagesAPI.markAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const deleteMessage = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await messagesAPI.delete(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            // If it was unread, decrease count
            const wasUnread = messages.find(m => m.id === id)?.read === false;
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // If less than 24 hours
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-amber-600 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-800 border border-gray-700 rounded-sm shadow-xl z-50 max-h-[80vh] overflow-y-auto">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-700">
                        {messages.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-4 hover:bg-gray-750 transition-colors ${!message.read ? 'bg-gray-700/30 border-l-4 border-amber-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs text-gray-400">{formatDate(message.created_at)}</p>
                                        <div className="flex gap-2">
                                            {!message.read && (
                                                <button
                                                    onClick={(e) => markAsRead(message.id, e)}
                                                    className="text-amber-600 hover:text-amber-500"
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => deleteMessage(message.id, e)}
                                                className="text-gray-500 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-200 leading-relaxed">{message.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
