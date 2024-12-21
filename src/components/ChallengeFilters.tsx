import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface ChallengeFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);

  const categories = ['mindfulness', 'health', 'education', 'lifestyle'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const durations = ['7days', '14days', '21days', '30days'];

  const toggleFilter = (value: string, type: 'category' | 'difficulty' | 'duration') => {
    const setter = type === 'category' ? setSelectedCategories :
                  type === 'difficulty' ? setSelectedDifficulties :
                  setSelectedDuration;
    const current = type === 'category' ? selectedCategories :
                   type === 'difficulty' ? selectedDifficulties :
                   selectedDuration;

    setter(current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('challenges.filters')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3">{t('challenges.filterCategories')}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category, 'category')}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategories.includes(category)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t(`challenges.categories.${category}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="font-medium mb-3">{t('challenges.filterDifficulty')}</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => toggleFilter(difficulty, 'difficulty')}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedDifficulties.includes(difficulty)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t(`challenges.difficulty.${difficulty}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="font-medium mb-3">{t('challenges.filterDuration')}</h3>
            <div className="flex flex-wrap gap-2">
              {durations.map(duration => (
                <button
                  key={duration}
                  onClick={() => toggleFilter(duration, 'duration')}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedDuration.includes(duration)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t(`challenges.duration.${duration}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('challenges.applyFilters')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeFilters;