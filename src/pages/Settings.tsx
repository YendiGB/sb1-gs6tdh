import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAffirmations } from '../hooks/useAffirmations';
import { useLocalization } from '../hooks/useLocalization';
import { useNotifications } from '../hooks/useNotifications';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { userData } = useAuthStore();
  const { getLocalizedContent } = useLocalization();
  const {
    categories,
    preferences,
    loading,
    error,
    updatePreferences
  } = useAffirmations({ userId: userData?.id });

  const {
    notificationStatus,
    preferences: notificationPrefs,
    updatePreferences: updateNotificationPrefs
  } = useNotifications(userData?.id);

  const handleCategoryToggle = async (categoryId: string) => {
    if (!preferences) return;
    
    const current = preferences.selectedCategories || [];
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    
    await updatePreferences(updated);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleNotificationToggle = async (type: 'dailyAffirmation' | 'challengeReminders') => {
    if (!notificationPrefs) return;

    await updateNotificationPrefs({
      ...notificationPrefs,
      [type]: !notificationPrefs[type]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4">
        <header className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </header>

        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('settings.affirmations')}</h2>
          <p className="text-gray-600 mb-6">
            {t('settings.affirmationsDescription')}
          </p>

          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div>
                  <h3 className="font-medium">
                    {getLocalizedContent(category.name)}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500">
                      {getLocalizedContent(category.description)}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={preferences?.selectedCategories?.includes(category.id) || false}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    preferences?.selectedCategories?.includes(category.id)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}>
                    {preferences?.selectedCategories?.includes(category.id) && (
                      <Check size={14} />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('settings.language')}</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-4 py-2 rounded-lg flex items-center justify-between ${
                i18n.language === 'en'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              English
              {i18n.language === 'en' && <Check size={16} />}
            </button>
            <button
              onClick={() => handleLanguageChange('es')}
              className={`px-4 py-2 rounded-lg flex items-center justify-between ${
                i18n.language === 'es'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Español
              {i18n.language === 'es' && <Check size={16} />}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">{t('settings.notifications')}</h2>
          {notificationStatus === 'denied' ? (
            <p className="text-sm text-red-600 mb-4">
              {t('settings.notificationsBlocked')}
            </p>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">{t('settings.dailyAffirmation')}</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs?.dailyAffirmation || false}
                  onChange={() => handleNotificationToggle('dailyAffirmation')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">{t('settings.challengeReminders')}</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs?.challengeReminders || false}
                  onChange={() => handleNotificationToggle('challengeReminders')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;