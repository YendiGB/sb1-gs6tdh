import React, { useState } from 'react';
import { X, Image, Trash2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { uploadFile } from '../../lib/storage';
import type { AffirmationCategory, Affirmation } from '../../types/affirmation';
import { useLocalization } from '../../hooks/useLocalization';

interface AffirmationFormProps {
  affirmation?: Affirmation | null;
  onClose: () => void;
  onSuccess: () => void;
  categories: AffirmationCategory[];
}

const AffirmationForm: React.FC<AffirmationFormProps> = ({
  affirmation,
  onClose,
  onSuccess,
  categories
}) => {
  const { getLocalizedContent } = useLocalization();
  const [formData, setFormData] = useState({
    text: affirmation?.text || { en: '', es: '' },
    category: affirmation?.category || '',
    images: affirmation?.images || { en: [], es: [] }
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, language: 'en' | 'es') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const result = await uploadFile(file, 'affirmations', {
        maxSizeMB: 2,
        onProgress: setUploadProgress,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      setFormData(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [language]: [
            ...prev.images[language],
            {
              url: result.url,
              width: 1080,
              height: 1080,
              aspectRatio: 'square'
            }
          ]
        }
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      setError(null);
      
      if (affirmation) {
        await updateDoc(doc(db, 'affirmations', affirmation.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'affirmations'), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save affirmation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {affirmation ? 'Edit Affirmation' : 'Add New Affirmation'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                category: e.target.value
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getLocalizedContent(category.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text (English)
            </label>
            <textarea
              value={formData.text.en}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                text: { ...prev.text, en: e.target.value }
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text (Spanish)
            </label>
            <textarea
              value={formData.text.es}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                text: { ...prev.text, es: e.target.value }
              }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={3}
              required
            />
          </div>

          {/* Image Upload Sections */}
          {(['en', 'es'] as const).map(lang => (
            <div key={lang}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({lang.toUpperCase()})
              </label>
              <div className="flex flex-wrap gap-4">
                {formData.images[lang].map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: {
                          ...prev.images,
                          [lang]: prev.images[lang].filter((_, i) => i !== index)
                        }
                      }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, lang)}
                    className="hidden"
                    id={`image-upload-${lang}`}
                  />
                  <label
                    htmlFor={`image-upload-${lang}`}
                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200"
                  >
                    <Image size={24} className="text-gray-400" />
                  </label>
                </div>
              </div>
              {uploading && (
                <div className="mt-2 text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {affirmation ? 'Update Affirmation' : 'Add Affirmation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AffirmationForm;