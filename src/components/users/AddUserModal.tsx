import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userData: {
    email: string;
    role: 'user' | 'admin';
    membershipType: 'free' | 'premium' | 'unlimited';
  }) => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'user' as const,
    membershipType: 'free' as const
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(formData);
    setFormData({ email: '', role: 'user', membershipType: 'free' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                role: e.target.value as 'user' | 'admin' 
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Membership Type
            </label>
            <select
              value={formData.membershipType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                membershipType: e.target.value as 'free' | 'premium' | 'unlimited' 
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;