import { useState, useEffect } from 'react';
import type { Book, BookFormData } from '../types/book';

const DEFAULT_FORM_DATA: BookFormData = {
  title: { en: '', es: '' },
  author: '',
  description: { en: '', es: '' },
  category: '',
  price: '0',
  membershipAccess: ['free'],
  coverFiles: { en: null, es: null },
  epubFiles: { en: null, es: null }
};

export function useBookForm(initialBook: Book | null = null) {
  const [formData, setFormData] = useState<BookFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (initialBook) {
      setFormData({
        title: initialBook.title,
        author: initialBook.author,
        description: initialBook.description,
        category: initialBook.category,
        price: initialBook.price.toString(),
        membershipAccess: initialBook.membershipAccess,
        coverFiles: { en: null, es: null },
        epubFiles: { en: null, es: null }
      });
    } else {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [initialBook]);

  const updateField = <K extends keyof BookFormData>(
    field: K,
    value: BookFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateLocalizedField = (
    field: 'title' | 'description',
    lang: 'en' | 'es',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }));
  };

  const updateFile = (
    field: 'coverFiles' | 'epubFiles',
    lang: 'en' | 'es',
    file: File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: file }
    }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  return {
    formData,
    updateField,
    updateLocalizedField,
    updateFile,
    resetForm
  };
}