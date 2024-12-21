import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { uploadFile, UploadError } from '../../lib/storage';
import type { Challenge, LocalizedContent, Task, DayPlan } from '../../types/challenge';

interface ChallengeFormProps {
  challenge?: Challenge | null;
  onSubmit: (data: Partial<Challenge>) => Promise<void>;
  onClose: () => void;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({ challenge, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Challenge>>(challenge || {
    title: { en: '', es: '' },
    description: { en: '', es: '' },
    category: 'mindfulness',
    difficulty: 'beginner',
    duration: 7,
    price: 0,
    membershipAccess: ['free'],
    dayPlans: [],
    published: false
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const result = await uploadFile(file, 'challenges', {
        maxSizeMB: 2,
        timeoutMs: 30000,
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        },
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      setFormData(prev => ({
        ...prev,
        thumbnail: result.url
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof UploadError ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      updatedAt: new Date().toISOString(),
      createdAt: challenge?.createdAt || new Date().toISOString()
    });
  };

  const updateLocalizedField = (
    field: keyof Pick<Challenge, 'title' | 'description'>,
    lang: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as LocalizedContent || {}),
        [lang]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {challenge ? 'Edit Challenge' : 'Add New Challenge'}
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
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div className="flex items-center gap-4">
              {formData.thumbnail ? (
                <img
                  src={formData.thumbnail}
                  alt="Challenge thumbnail"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {uploading ? `Uploading... ${uploadProgress}%` : 'Choose Image'}
                </label>
                {uploadError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English)
              </label>
              <input
                type="text"
                value={(formData.title as LocalizedContent)?.en || ''}
                onChange={(e) => updateLocalizedField('title', 'en', e.target.value)}
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
                value={(formData.title as LocalizedContent)?.es || ''}
                onChange={(e) => updateLocalizedField('title', 'es', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (English)
              </label>
              <textarea
                value={(formData.description as LocalizedContent)?.en || ''}
                onChange={(e) => updateLocalizedField('description', 'en', e.target.value)}
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
                value={(formData.description as LocalizedContent)?.es || ''}
                onChange={(e) => updateLocalizedField('description', 'es', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category || 'mindfulness'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  category: e.target.value as Challenge['category']
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="mindfulness">Mindfulness</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty || 'beginner'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as Challenge['difficulty']
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.duration || 7}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duration: parseInt(e.target.value) 
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  price: parseFloat(e.target.value) 
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
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
                    checked={formData.membershipAccess?.includes(level)}
                    onChange={(e) => {
                      const current = formData.membershipAccess || [];
                      setFormData(prev => ({
                        ...prev,
                        membershipAccess: e.target.checked
                          ? [...current, level]
                          : current.filter(l => l !== level)
                      }));
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Published Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  published: e.target.checked 
                }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Publish Challenge</span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : challenge ? 'Update Challenge' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeForm;