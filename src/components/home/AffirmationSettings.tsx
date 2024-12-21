import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import type { AffirmationCategory } from '../../types/affirmation';
import { useLocalization } from '../../hooks/useLocalization';

interface AffirmationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AffirmationCategory[];
  selectedCategories: string[];
  onUpdatePreferences: (categoryIds: string[]) => Promise<void>;
}

const AffirmationSettings: React.FC<AffirmationSettingsProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onUpdatePreferences
}) => {
  const { t } = useTranslation();
  const { getLocalizedContent } = useLocalization();
  
  if (!isOpen) return null;

  const handleToggleCategory = async (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    await onUpdatePreferences(newSelection);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {t('home.affirmation.settings')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {t('home.affirmation.settingsDescription')}
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
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleToggleCategory(category.id)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedCategories.includes(category.id)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedCategories.includes(category.id) && (
                      <Check size={14} />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffirmationSettings;