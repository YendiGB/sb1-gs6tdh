import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Camera, Check } from 'lucide-react';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  username: string;
  email: string;
  fullName: string;
  numberOfKids: number;
  language: string;
  profilePicture: string;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>({
    username: 'sarah_smith',
    email: 'sarah@example.com',
    fullName: 'Sarah Smith',
    numberOfKids: 2,
    language: i18n.language,
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
  });

  const languages = [
    { code: 'en', name: t('profile.languages.en') },
    { code: 'es', name: t('profile.languages.es') }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setProfile(prev => ({ ...prev, language: langCode }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">{t('profile.settings')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={profile.profilePicture}
                  alt={profile.fullName}
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
            <div className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`px-4 py-2 rounded-lg flex items-center justify-between ${
                        profile.language === lang.code
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {lang.name}
                      {profile.language === lang.code && (
                        <Check size={16} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('profile.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;