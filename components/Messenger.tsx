import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagesAPI, usersAPI } from '../src/api';
import { Message, User } from '../types';
import { Send, MessageSquare, User as UserIcon, Search } from 'lucide-react';

interface MessengerProps {
    className?: string;
}

const Messenger: React.FC<MessengerProps> = ({ className = '' }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<User[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<User[]>([]);
    const [selectedContact, setSelectedContact] = useState<User | null>(null);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            loadContacts();
        }
    }, [user]);

    useEffect(() => {
        if (selectedContact) {
            loadConversation(selectedContact.id);
            const interval = setInterval(() => {
                loadConversation(selectedContact.id);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            setFilteredContacts(contacts.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
            ));
        }
    }, [searchTerm, contacts]);

    const loadContacts = async () => {
        try {
            const users = await usersAPI.getAll();

            let relevantContacts = users.filter((u: User) => String(u.id) !== String(user?.id));

            if (user?.role === 'customer') {
                relevantContacts = relevantContacts.filter((u: User) => u.role === 'admin' || u.role === 'barber');
            }

            setContacts(relevantContacts);
            setFilteredContacts(relevantContacts);

            if (relevantContacts.length > 0 && !selectedContact) {
                setSelectedContact(relevantContacts[0]);
            }
        } catch (error: any) {
            console.error('Error loading contacts:', error);
            if (error.message && error.message.includes('Invalid token')) {
                // Handle token error if needed, or let the parent/interceptor handle it
            }
        } finally {
            setLoading(false);
        }
    };

    const loadConversation = async (contactId: number) => {
        try {
            const msgs = await messagesAPI.getConversation(contactId.toString());
            setConversation(msgs);

            const unreadIds = msgs
                .filter((m: Message) => m.sender_id === contactId && !m.read)
                .map((m: Message) => m.id);

            if (unreadIds.length > 0) {
                unreadIds.forEach((id: number) => messagesAPI.markAsRead(id.toString()));
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedContact || !newMessage.trim()) return;

        try {
            await messagesAPI.send({
                recipientId: selectedContact.id,
                subject: 'Chat Message',
                content: newMessage
            });
            setNewMessage('');
            loadConversation(selectedContact.id);
        } catch (error: any) {
            console.error('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-white">Loading...</div>;
    }

    return (
        <div className={`bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden flex flex-col md:flex-row ${className}`}>
            {/* Sidebar - Contacts */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col bg-gray-850">
                <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.map(contact => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 ${selectedContact?.id === contact.id ? 'bg-gray-700 border-l-4 border-l-amber-500' : ''
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                                {contact.image ? (
                                    <img src={contact.image} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="text-gray-300" size={20} />
                                )}
                            </div>
                            <div className="text-left overflow-hidden">
                                <h3 className="font-bold text-white truncate">{contact.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${contact.role === 'admin' ? 'bg-red-900/50 text-red-200' :
                                            contact.role === 'barber' ? 'bg-amber-900/50 text-amber-200' :
                                                'bg-blue-900/50 text-blue-200'
                                        }`}>
                                        {contact.role}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}

                    {filteredContacts.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No contacts found
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-900/50">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center gap-3 shadow-md z-10">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                {selectedContact.image ? (
                                    <img src={selectedContact.image} alt={selectedContact.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="text-gray-300" size={20} />
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">{selectedContact.name}</h2>
                                <span className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                            {conversation.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <MessageSquare size={48} className="mb-2" />
                                    <p>Start a conversation with {selectedContact.name}</p>
                                </div>
                            ) : (
                                conversation.map((msg, index) => {
                                    const isMe = msg.sender_id === user?.id;
                                    const showDate = index === 0 || new Date(msg.created_at).toDateString() !== new Date(conversation[index - 1].created_at).toDateString();

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDate && (
                                                <div className="flex justify-center my-4">
                                                    <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                                                        {new Date(msg.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe
                                                        ? 'bg-amber-600 text-white rounded-tr-none'
                                                        : 'bg-gray-700 text-gray-100 rounded-tl-none'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-amber-200' : 'text-gray-400'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-gray-800 border-t border-gray-700">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-full px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-amber-600 text-white p-3 rounded-full hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Select a contact to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;
