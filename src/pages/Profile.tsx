import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuthStore();
  const [profile, setProfile] = useState({
    username: userData?.email?.split('@')[0] || '',
    email: userData?.email || '',
    fullName: '',
    numberOfKids: 0
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle image upload
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4">
        <header className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        </header>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces"
                alt={profile.fullName || profile.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.username')}
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.email')}
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.fullName')}
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={e => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.numberOfKids')}
              </label>
              <input
                type="number"
                min="0"
                value={profile.numberOfKids}
                onChange={e => setProfile(prev => ({ ...prev, numberOfKids: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('profile.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;