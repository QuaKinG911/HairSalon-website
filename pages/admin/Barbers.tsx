import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { STYLISTS } from '../../constants';
import { Stylist } from '../../types';

const AdminBarbers: React.FC = () => {
    const navigate = useNavigate();
    const [barbers, setBarbers] = useState<Stylist[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Stylist>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState<Partial<Stylist>>({});

    useEffect(() => {
        // Load barbers from localStorage, fallback to constants
        const storedBarbers = localStorage.getItem('barbers');
        if (storedBarbers) {
            setBarbers(JSON.parse(storedBarbers));
        } else {
            // Initialize with default barbers
            setBarbers(STYLISTS);
            localStorage.setItem('barbers', JSON.stringify(STYLISTS));
        }
    }, []);

    const saveBarbers = (updatedBarbers: Stylist[]) => {
        setBarbers(updatedBarbers);
        localStorage.setItem('barbers', JSON.stringify(updatedBarbers));
    };

    const handleEdit = (barber: Stylist) => {
        setEditingId(barber.id);
        setEditForm(barber);
    };

    const handleSave = () => {
        if (!editingId) return;

        const updatedBarbers = barbers.map(b =>
            b.id === editingId ? { ...b, ...editForm } as Stylist : b
        );
        saveBarbers(updatedBarbers);
        setEditingId(null);
        setEditForm({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this barber?')) {
            const updatedBarbers = barbers.filter(b => b.id !== id);
            saveBarbers(updatedBarbers);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setAddForm({
            name: '',
            role: 'Barber',
            bio: '',
            image: '/images/services/TheExecutiveCut.jpg',
            specialties: []
        });
    };

    const handleSaveNew = () => {
        if (!addForm.name || !addForm.role || !addForm.bio) {
            alert('Please fill in all required fields');
            return;
        }

        const newBarber: Stylist = {
            id: `barber-${Date.now()}`,
            name: addForm.name!,
            role: addForm.role!,
            bio: addForm.bio!,
            image: addForm.image!,
            specialties: addForm.specialties || []
        };

        const updatedBarbers = [...barbers, newBarber];
        saveBarbers(updatedBarbers);
        setIsAdding(false);
        setAddForm({});
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setAddForm({});
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (isEditing) {
                    setEditForm({ ...editForm, image: dataUrl });
                } else {
                    setAddForm({ ...addForm, image: dataUrl });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSpecialtyChange = (specialty: string, isEditing: boolean = false) => {
        const form = isEditing ? editForm : addForm;
        const setForm = isEditing ? setEditForm : setAddForm;

        const currentSpecialties = form.specialties || [];
        const updatedSpecialties = currentSpecialties.includes(specialty)
            ? currentSpecialties.filter(s => s !== specialty)
            : [...currentSpecialties, specialty];

        setForm({ ...form, specialties: updatedSpecialties });
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-sm border border-gray-700 overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
                    <h1 className="text-3xl font-bold font-serif text-white">Barbers Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your barber team and their profiles</p>
                </div>

                <div className="p-8">
                    <div className="mb-6">
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-black rounded-sm hover:bg-amber-500 transition-colors font-bold uppercase tracking-wide"
                        >
                            <Plus size={20} /> Add New Barber
                        </button>
                    </div>

                    {isAdding && (
                        <div className="border-2 border-dashed border-gray-600 rounded-sm p-6 mb-6 bg-gray-900/50">
                            <h3 className="text-lg font-bold text-white mb-4">Add New Barber</h3>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={addForm.name || ''}
                                            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Role</label>
                                        <select
                                            value={addForm.role || ''}
                                            onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                        >
                                            <option value="Barber">Barber</option>
                                            <option value="Senior Stylist">Senior Stylist</option>
                                            <option value="Master Barber">Master Barber</option>
                                            <option value="Fade Specialist">Fade Specialist</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Profile Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e)}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-black hover:file:bg-amber-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Bio</label>
                                    <textarea
                                        value={addForm.bio || ''}
                                        onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                                        rows={3}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                        placeholder="Tell us about this barber's experience and specialties..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Specialties</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {['Hot Towel Shaves', 'Precision Shear Work', 'Classic Pompadours', 'Skin Fades', 'Hair Tattoos', 'Beard Shaping', 'Long Hair Styling', 'Texturizing', 'Grey Blending'].map(specialty => (
                                            <label key={specialty} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={addForm.specialties?.includes(specialty) || false}
                                                    onChange={() => handleSpecialtyChange(specialty)}
                                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="text-sm">{specialty}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveNew}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-500 transition-colors"
                                    >
                                        <Save size={18} /> Save Barber
                                    </button>
                                    <button
                                        onClick={handleCancelAdd}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-black rounded-sm hover:bg-gray-400 transition-colors"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {barbers.map(barber => (
                            <div key={barber.id} className="border border-gray-700 bg-gray-800 rounded-sm p-6 hover:border-gray-600 transition-all">
                                {editingId === barber.id ? (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">Role</label>
                                                <select
                                                    value={editForm.role || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                                >
                                                    <option value="Barber">Barber</option>
                                                    <option value="Senior Stylist">Senior Stylist</option>
                                                    <option value="Master Barber">Master Barber</option>
                                                    <option value="Fade Specialist">Fade Specialist</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-300 mb-2">Profile Image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, true)}
                                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-black hover:file:bg-amber-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-2">Bio</label>
                                            <textarea
                                                value={editForm.bio || ''}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-2">Specialties</label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {['Hot Towel Shaves', 'Precision Shear Work', 'Classic Pompadours', 'Skin Fades', 'Hair Tattoos', 'Beard Shaping', 'Long Hair Styling', 'Texturizing', 'Grey Blending'].map(specialty => (
                                                    <label key={specialty} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.specialties?.includes(specialty) || false}
                                                            onChange={() => handleSpecialtyChange(specialty, true)}
                                                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                        />
                                                        <span className="text-sm">{specialty}</span>
                                                    </label>
                                                ))}
                                            </div>
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
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-black rounded-sm hover:bg-gray-400 transition-colors"
                                            >
                                                <X size={18} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <img src={barber.image} alt={barber.name} className="w-24 h-24 rounded-sm object-cover filter brightness-75" />
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                                                <p className="text-sm text-amber-500 uppercase tracking-wider mb-2">{barber.role}</p>
                                                <p className="text-gray-400 text-sm mb-2">{barber.bio}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {barber.specialties.map((tech, idx) => (
                                                        <span key={idx} className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(barber)}
                                                className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(barber.id)}
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

export default AdminBarbers;