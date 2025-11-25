import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messagesAPI, usersAPI } from '../../src/api';
import { Message, User } from '../../types';
import { Send, MessageSquare, User as UserIcon } from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipients, setRecipients] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [messagesRes, usersRes] = await Promise.all([
        messagesAPI.getMyMessages(),
        usersAPI.getAll()
      ]);
      setMessages(messagesRes);
      // Filter users to barbers and admin
      const filteredRecipients = usersRes.filter((u: User) => u.role === 'barber' || u.role === 'admin');
      setRecipients(filteredRecipients);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (error.message.includes('Invalid token')) {
        // Redirect to login if token invalid
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedRecipient || !newMessage.subject || !newMessage.content) return;

    try {
      await messagesAPI.send({
        recipientId: selectedRecipient,
        subject: newMessage.subject,
        content: newMessage.content
      });
      setNewMessage({ subject: '', content: '' });
      loadData(); // Refresh messages
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message.includes('Invalid token')) {
        window.location.href = '/login';
      }
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await messagesAPI.markAsRead(messageId);
      loadData();
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      if (error.message.includes('Invalid token')) {
        window.location.href = '/login';
      }
    }
  };

  const getRecipientName = (recipientId: number) => {
    const recipient = recipients.find((r: User) => r.id === recipientId);
    return recipient ? recipient.name : 'Unknown';
  };

  const getSenderName = (senderId: number) => {
    const recipient = recipients.find((r: User) => r.id === senderId);
    return recipient ? recipient.name : 'Unknown';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare size={32} className="text-amber-500" />
        <h1 className="text-3xl font-serif font-bold text-white">Messages</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Send Message */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Send Message</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">To:</label>
              <select
                value={selectedRecipient || ''}
                onChange={(e) => setSelectedRecipient(parseInt(e.target.value))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-amber-500 focus:border-transparent text-white"
              >
                <option value="">Select recipient</option>
                {recipients.map(recipient => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.role === 'admin' ? 'Admin Support' : `Barber: ${recipient.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subject:</label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-amber-500 focus:border-transparent text-white"
                placeholder="Message subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Message:</label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-amber-500 focus:border-transparent text-white"
                placeholder="Your message"
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!selectedRecipient || !newMessage.subject || !newMessage.content}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Send Message
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Your Messages</h2>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No messages yet</p>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg ${message.read ? 'bg-gray-700' : 'bg-amber-900/30 border-amber-600'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} className="text-gray-500" />
                      <span className="font-medium">
                        {message.sender_id === parseInt(user?.id || '0') ? 'You' : getSenderName(message.sender_id)}
                      </span>
                      <span className="text-sm text-gray-400">to</span>
                      <span className="font-medium">
                        {message.recipient_id === parseInt(user?.id || '0') ? 'You' : getRecipientName(message.recipient_id)}
                      </span>
                    </div>
                    {!message.read && message.recipient_id === parseInt(user?.id || '0') && (
                      <button
                        onClick={() => markAsRead(message.id)}
                        className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>

                  <h3 className="font-semibold text-white mb-1">{message.subject}</h3>
                  <p className="text-gray-300 text-sm mb-2">{message.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;