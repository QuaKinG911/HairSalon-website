import React from 'react';
import { MessageSquare } from 'lucide-react';
import Messenger from '../components/Messenger';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare size={32} className="text-amber-500" />
          <h1 className="text-3xl font-serif font-bold text-white">Messages</h1>
        </div>

        <Messenger className="h-[calc(100vh-150px)]" />
      </div>
    </div>
  );
};

export default Contact;