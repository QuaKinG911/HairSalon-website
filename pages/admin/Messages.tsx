import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';

import { messagesAPI, usersAPI } from '../../src/api';
import { Message, User } from '../../types';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
    senderId: number;
}

const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const [msgs, users] = await Promise.all([
                messagesAPI.getMyMessages(),
                usersAPI.getAll()
            ]);

            const formattedMessages = msgs.map((m: Message) => {
                const sender = users.find((u: User) => u.id === m.sender_id);
                return {
                    id: m.id,
                    name: sender?.name || 'Unknown',
                    email: sender?.email || 'Unknown',
                    subject: m.subject,
                    message: m.content,
                    createdAt: m.created_at,
                    read: m.read,
                    senderId: m.sender_id
                };
            });

            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await messagesAPI.markAsRead(id);
            setMessages(prev => prev.map(m =>
                m.id === id ? { ...m, read: true } : m
            ));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            try {
                await messagesAPI.delete(id);
                setMessages(prev => prev.filter(m => m.id !== id));
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    };

    const handleSelectMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        if (!message.read) {
            markAsRead(message.id);
        }
    };

    const unreadCount = messages.filter(m => !m.read).length;

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 rounded-sm border border-gray-700 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
                    <h1 className="text-3xl font-bold font-serif text-white">Contact Messages</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 h-[600px]">
                    {/* Messages List */}
                    <div className="md:col-span-1 border-r border-gray-700 overflow-y-auto bg-gray-800">
                        {messages.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Mail size={48} className="mx-auto mb-4 text-gray-600" />
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            <div>
                                {messages.map(message => (
                                    <button
                                        key={message.id}
                                        onClick={() => handleSelectMessage(message)}
                                        className={`w-full text-left p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors ${selectedMessage?.id === message.id ? 'bg-gray-700' : ''
                                            } ${!message.read ? 'bg-amber-900/10 border-l-4 border-l-amber-500' : ''}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {message.read ? (
                                                    <MailOpen size={16} className="text-gray-500" />
                                                ) : (
                                                    <Mail size={16} className="text-amber-500" />
                                                )}
                                                <span className={`font-bold text-sm ${!message.read ? 'text-white' : 'text-gray-400'}`}>
                                                    {message.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(message.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-300 mb-1">{message.subject}</p>
                                        <p className="text-xs text-gray-500 truncate">{message.message}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className="md:col-span-2 p-8 overflow-y-auto bg-gray-900/50">
                        {selectedMessage ? (
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold font-serif text-white mb-2">{selectedMessage.subject}</h2>
                                        <p className="text-sm text-gray-400">
                                            From: <strong className="text-gray-200">{selectedMessage.name}</strong> ({selectedMessage.email})
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(selectedMessage.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(selectedMessage.id)}
                                        className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                                        title="Delete message"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="bg-gray-800 rounded-sm p-6 border border-gray-700">
                                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="px-6 py-3 bg-amber-600 text-black rounded-sm font-bold hover:bg-amber-500 transition-colors uppercase tracking-wide text-sm"
                                    >
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600">
                                <div className="text-center">
                                    <Mail size={64} className="mx-auto mb-4" />
                                    <p>Select a message to view</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
