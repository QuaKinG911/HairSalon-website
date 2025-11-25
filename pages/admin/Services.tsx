import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { SERVICES } from '../../constants';

import { Service } from '../../types';

const AdminServices: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Service & { category: string }>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState<Partial<Service & { category: string }>>({});

    useEffect(() => {
        // Always use the latest services from constants
        setServices(SERVICES);
        // Update localStorage with the latest data
        localStorage.setItem('services', JSON.stringify(SERVICES));
    }, []);

    const saveServices = (updatedServices: Service[]) => {
        setServices(updatedServices);
        localStorage.setItem('services', JSON.stringify(updatedServices));
    };

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setEditForm(service);
    };

    const handleSave = () => {
        if (!editingId) return;

        const updatedServices = services.map(s =>
            s.id === editingId ? { ...s, ...editForm } as Service : s
        );
        saveServices(updatedServices);
        setEditingId(null);
        setEditForm({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            const updatedServices = services.filter(s => s.id !== id);
            saveServices(updatedServices);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setAddForm({
            name: '',
            category: 'Haircuts',
            price: 0,
            duration: '',
            description: '',
            image: '/images/services/default-service.jpg'
        });
    };

    const handleSaveNew = () => {
        if (!addForm.name || !addForm.category || !addForm.price || !addForm.duration || !addForm.description) {
            alert('Please fill in all fields');
            return;
        }

        const newService: Service = {
            id: `service-${Date.now()}`,
            name: addForm.name!,
            category: addForm.category as Service['category'],
            price: addForm.price!,
            duration: addForm.duration!,
            description: addForm.description!,
            image: addForm.image!
        };

        const updatedServices = [...services, newService];
        saveServices(updatedServices);
        setIsAdding(false);
        setAddForm({});
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setAddForm({});
    };

    return (
        <div className="space-y-6">

            <div className="bg-gray-800 rounded-sm border border-gray-700 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
                    <h1 className="text-3xl font-bold font-serif text-white">Services Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your services and pricing</p>
                </div>

                <div className="p-8">
                    <div className="mb-6">
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-black rounded-sm hover:bg-amber-500 transition-colors font-bold uppercase tracking-wide"
                        >
                            <Plus size={20} /> Add New Service
                        </button>
                    </div>

                    {isAdding && (
                        <div className="border-2 border-dashed border-gray-600 rounded-sm p-6 mb-6 bg-gray-900/50">
                            <h3 className="text-lg font-bold text-white mb-4">Add New Service</h3>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Service Name</label>
                                        <input
                                            type="text"
                                            value={addForm.name || ''}
                                            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                            placeholder="e.g., Premium Haircut"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                                        <select
                                            value={addForm.category || ''}
                                            onChange={(e) => setAddForm({ ...addForm, category: e.target.value as Service['category'] })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                        >
                                            <option value="Haircuts">Haircuts</option>
                                            <option value="Beard & Shave">Beard & Shave</option>
                                            <option value="Grooming">Grooming</option>
                                            <option value="Packages">Packages</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Price ($)</label>
                                        <input
                                            type="number"
                                            value={addForm.price || 0}
                                            onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Duration</label>
                                        <input
                                            type="text"
                                            value={addForm.duration || ''}
                                            onChange={(e) => setAddForm({ ...addForm, duration: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                            placeholder="e.g., 30 minutes"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={addForm.description || ''}
                                        onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                        placeholder="Describe the service..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveNew}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-500 transition-colors"
                                    >
                                        <Save size={18} /> Save Service
                                    </button>
                                    <button
                                        onClick={handleCancelAdd}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-sm hover:bg-gray-600 transition-colors"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {services.map(service => (
                            <div key={service.id} className="border border-gray-700 bg-gray-800 rounded-sm p-6 hover:border-gray-600 transition-all">
                                {editingId === service.id ? (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">Service Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                                                <select
                                                    value={editForm.category || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Service['category'] })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="Haircuts">Haircuts</option>
                                                    <option value="Beard & Shave">Beard & Shave</option>
                                                    <option value="Grooming">Grooming</option>
                                                    <option value="Packages">Packages</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={editForm.price || 0}
                                                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2">Duration</label>
                                                <input
                                                    type="text"
                                                    value={editForm.duration || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                                            <textarea
                                                value={editForm.description || ''}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-500 transition-colors"
                                            >
                                                <Save size={18} /> Save Changes
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-sm hover:bg-gray-600 transition-colors"
                                            >
                                                <X size={18} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <img src={service.image} alt={service.name} className="w-24 h-24 rounded-sm object-cover filter brightness-75" />
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{service.name}</h3>
                                                <p className="text-sm text-amber-500 uppercase tracking-wider mb-2">{service.category}</p>
                                                <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                                                <div className="flex gap-4 text-sm">
                                                    <span className="text-gray-400">Duration: <strong className="text-gray-200">{service.duration}</strong></span>
                                                    <span className="text-gray-400">Price: <strong className="text-green-400">${service.price}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminServices;
