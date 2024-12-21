import { useTranslation } from 'react-i18next';
import type { LocalizedContent } from '../types/book';

export function useLocalization() {
  const { i18n } = useTranslation();

  const getLocalizedContent = (content: LocalizedContent | undefined | string): string => {
    if (!content) return '';
    
    // If content is already a string, return it
    if (typeof content === 'string') return content;
    
    // Try to get content in current language
    const localizedContent = content[i18n.language];
    if (localizedContent) return localizedContent;

    // Fallback to English if current language is not available
    if (content.en) return content.en;

    // Last resort: return first available translation
    const availableTranslation = Object.values(content)[0];
    return availableTranslation || '';
  };

  const getLocalizedUrl = (urls: { [key: string]: string | undefined } | undefined): string | undefined => {
    if (!urls) return undefined;

    // Try to get URL in current language
    const localizedUrl = urls[i18n.language];
    if (localizedUrl) return localizedUrl;

    // Fallback to English if current language is not available
    if (urls.en) return urls.en;

    // Last resort: return first available URL
    return Object.values(urls).find(url => url !== undefined);
  };

  return {
    getLocalizedContent,
    getLocalizedUrl,
    currentLanguage: i18n.language
  };
}