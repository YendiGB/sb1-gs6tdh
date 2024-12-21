import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

interface LanguageMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageMenu: React.FC<LanguageMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();

  if (!isOpen) return null;

  const languages = [
    { code: 'en', name: t('profile.languages.en') },
    { code: 'es', name: t('profile.languages.es') }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
      />
      <div className="fixed top-16 right-4 bg-white rounded-xl shadow-lg p-2 w-48 z-50">
        <h3 className="px-3 py-2 text-sm font-medium text-gray-500">
          {t('profile.language')}
        </h3>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 rounded-lg"
          >
            {lang.name}
            {i18n.language === lang.code && (
              <Check size={16} className="text-primary" />
            )}
          </button>
        ))}
      </div>
    </>
  );
};

export default LanguageMenu;