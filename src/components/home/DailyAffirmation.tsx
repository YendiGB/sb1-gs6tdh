import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Share2, MoreVertical, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAffirmations } from '../../hooks/useAffirmations';
import { useAuthStore } from '../../store/authStore';
import { useLocalization } from '../../hooks/useLocalization';

const DailyAffirmation: React.FC = () => {
  const { t } = useTranslation();
  const { getLocalizedContent } = useLocalization();
  const { userData } = useAuthStore();
  
  const {
    dailyAffirmation,
    categories,
    preferences,
    loading,
    error
  } = useAffirmations({ userId: userData?.id });

  if (loading) {
    return (
      <div className="card bg-primary/5 animate-pulse">
        <div className="h-6 bg-primary/10 rounded w-1/3 mb-4" />
        <div className="h-20 bg-primary/10 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="card bg-primary/5">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold">{t('home.affirmation.title')}</h2>
        <div className="flex gap-2">
          <Link
            to="/settings"
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </Link>
          {dailyAffirmation?.images?.en?.[0] && (
            <button
              onClick={() => {
                const image = dailyAffirmation.images.en[0];
                const link = document.createElement('a');
                link.href = image.url;
                link.download = 'daily-affirmation.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
              title="Download as wallpaper"
            >
              <Download size={20} className="text-gray-600" />
            </button>
          )}
          <Share2 size={20} className="text-gray-600" />
          <MoreVertical size={20} className="text-gray-600" />
        </div>
      </div>

      {dailyAffirmation ? (
        <div>
          {dailyAffirmation.images?.en?.[0] && (
            <img
              src={dailyAffirmation.images.en[0].url}
              alt=""
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-xl font-display italic">
            {getLocalizedContent(dailyAffirmation.text)}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {categories.length === 0 
              ? t('home.affirmation.noCategories')
              : preferences?.selectedCategories?.length === 0
              ? t('home.affirmation.noSelectedCategories')
              : t('home.affirmation.noAffirmation')}
          </p>
          <Link
            to="/settings"
            className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors inline-block"
          >
            {t('home.affirmation.selectCategories')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default DailyAffirmation;