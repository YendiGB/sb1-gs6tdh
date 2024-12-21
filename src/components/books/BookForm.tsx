import React from 'react';
import { X, Trash2 } from 'lucide-react';
import type { BookFormData } from '../../types/book';

interface BookFormProps {
  formData: BookFormData;
  onUpdateField: <K extends keyof BookFormData>(field: K, value: BookFormData[K]) => void;
  onUpdateLocalizedField: (field: 'title' | 'description', lang: 'en' | 'es', value: string) => void;
  onUpdateFile: (field: 'coverFiles' | 'epubFiles', lang: 'en' | 'es', file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  isEditing: boolean;
  existingFiles?: {
    coverUrl?: { [key: string]: string | undefined };
    epubUrl?: { [key: string]: string | undefined };
  };
  onDeleteFile?: (type: 'coverUrl' | 'epubUrl', lang: string) => Promise<void>;
}

const BookForm: React.FC<BookFormProps> = ({
  formData,
  onUpdateField,
  onUpdateLocalizedField,
  onUpdateFile,
  onSubmit,
  onClose,
  loading,
  isEditing,
  existingFiles,
  onDeleteFile
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Book' : 'Add New Book'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English)
              </label>
              <input
                type="text"
                value={formData.title.en}
                onChange={(e) => onUpdateLocalizedField('title', 'en', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Spanish)
              </label>
              <input
                type="text"
                value={formData.title.es}
                onChange={(e) => onUpdateLocalizedField('title', 'es', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => onUpdateField('author', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (English)
              </label>
              <textarea
                value={formData.description.en}
                onChange={(e) => onUpdateLocalizedField('description', 'en', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Spanish)
              </label>
              <textarea
                value={formData.description.es}
                onChange={(e) => onUpdateLocalizedField('description', 'es', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => onUpdateField('category', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => onUpdateField('price', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Membership Access */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membership Access
            </label>
            <div className="space-y-2">
              {(['free', 'premium', 'unlimited'] as const).map((level) => (
                <label key={level} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.membershipAccess.includes(level)}
                    onChange={(e) => {
                      const current = formData.membershipAccess;
                      onUpdateField(
                        'membershipAccess',
                        e.target.checked
                          ? [...current, level]
                          : current.filter(l => l !== level)
                      );
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cover Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Images
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['en', 'es'] as const).map(lang => (
                <div key={`cover-${lang}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium uppercase">{lang}</span>
                    {existingFiles?.coverUrl?.[lang] && (
                      <button
                        type="button"
                        onClick={() => onDeleteFile?.('coverUrl', lang)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                  {existingFiles?.coverUrl?.[lang] && (
                    <img
                      src={existingFiles.coverUrl[lang]}
                      alt={`Cover ${lang}`}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onUpdateFile('coverFiles', lang, e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* EPUB Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              EPUB Files
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['en', 'es'] as const).map(lang => (
                <div key={`epub-${lang}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium uppercase">{lang}</span>
                    {existingFiles?.epubUrl?.[lang] && (
                      <button
                        type="button"
                        onClick={() => onDeleteFile?.('epubUrl', lang)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                  {existingFiles?.epubUrl?.[lang] && (
                    <div className="text-xs text-gray-600 truncate">
                      Current: {new URL(existingFiles.epubUrl[lang]!).pathname.split('/').pop()}
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".epub"
                    onChange={(e) => onUpdateFile('epubFiles', lang, e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Book' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;