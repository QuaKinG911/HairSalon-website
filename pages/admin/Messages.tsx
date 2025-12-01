import React from 'react';
import Messenger from '../../components/Messenger';

const AdminMessages: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700 rounded-t-lg">
                <h1 className="text-3xl font-bold font-serif text-white">Messages</h1>
                <p className="text-gray-400 text-sm mt-1">Chat with customers and staff</p>
            </div>

            <Messenger className="h-[calc(100vh-250px)] rounded-t-none border-t-0" />
        </div>
    );
};

export default AdminMessages;
