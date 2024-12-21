import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Shield, Search, Filter, UserPlus } from 'lucide-react';
import type { User } from '../../types/user';
import UserActions from '../../components/users/UserActions';
import AddUserModal from '../../components/users/AddUserModal';
import UserAssignments from '../../components/users/UserAssignments';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      if (!db) throw new Error('Database is not initialized');
      const querySnapshot = await getDocs(collection(db, 'users'));
      const loadedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(loadedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleAddUser = async (userData: Omit<User, 'id' | 'createdAt' | 'purchasedBooks' | 'purchasedChallenges'>) => {
    try {
      if (!db) throw new Error('Database is not initialized');
      
      const newUser = {
        ...userData,
        createdAt: new Date().toISOString(),
        purchasedBooks: [],
        purchasedChallenges: []
      };

      await addDoc(collection(db, 'users'), newUser);
      await loadUsers();
      setIsAddingUser(false);
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user. Please try again.');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      if (!db) throw new Error('Database is not initialized');
      await updateDoc(doc(db, 'users', userId), updates);
      await loadUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      if (!db) throw new Error('Database is not initialized');
      await deleteDoc(doc(db, 'users', userId));
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleAssignContent = async (type: 'book' | 'challenge', ids: string[]) => {
    if (!assigningUser || !db) return;

    try {
      const field = type === 'book' ? 'purchasedBooks' : 'purchasedChallenges';
      await updateDoc(doc(db, 'users', assigningUser.id), {
        [field]: ids
      });
      await loadUsers();
    } catch (error) {
      console.error('Error assigning content:', error);
      setError('Failed to assign content. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesMembership = !selectedMembership || user.membershipType === selectedMembership;
    return matchesSearch && matchesRole && matchesMembership;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setIsAddingUser(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value || null)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={selectedMembership || ''}
            onChange={(e) => setSelectedMembership(e.target.value || null)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Memberships</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="unlimited">Unlimited</option>
          </select>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Membership</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Joined</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                      className="px-2 py-1 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.membershipType}
                      onChange={(e) => setEditingUser({ 
                        ...editingUser, 
                        membershipType: e.target.value as 'free' | 'premium' | 'unlimited' 
                      })}
                      className="px-2 py-1 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.membershipType === 'premium' ? 'bg-green-100 text-green-700' :
                      user.membershipType === 'unlimited' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.membershipType}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <UserActions
                    user={user}
                    editingUser={editingUser}
                    onEdit={setEditingUser}
                    onDelete={handleDeleteUser}
                    onUpdate={handleUpdateUser}
                    onCancelEdit={() => setEditingUser(null)}
                    onAssign={setAssigningUser}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isAddingUser}
        onClose={() => setIsAddingUser(false)}
        onAdd={handleAddUser}
      />

      {assigningUser && (
        <UserAssignments
          isOpen={true}
          onClose={() => setAssigningUser(null)}
          userId={assigningUser.id}
          purchasedBooks={assigningUser.purchasedBooks}
          purchasedChallenges={assigningUser.purchasedChallenges}
          onAssign={handleAssignContent}
        />
      )}
    </div>
  );
};

export default Users;