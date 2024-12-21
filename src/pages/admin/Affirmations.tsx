import React, { useState, useEffect } from 'react';
import { Plus, Upload, Search, Filter, MessageCircle, Image, Edit, Trash2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAffirmations } from '../../hooks/useAffirmations';
import { useLocalization } from '../../hooks/useLocalization';
import type { Affirmation } from '../../types/affirmation';
import AffirmationForm from '../../components/admin/AffirmationForm';
import BulkImportModal from '../../components/admin/BulkImportModal';

const Affirmations: React.FC = () => {
  const { getLocalizedContent } = useLocalization();
  const { categories, loading: categoriesLoading, error: categoriesError } = useAffirmations();
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAffirmation, setIsAddingAffirmation] = useState(false);
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'es'>('all');

  useEffect(() => {
    loadAffirmations();
  }, []);

  const loadAffirmations = async () => {
    try {
      if (!db) throw new Error('Database not initialized');

      const affirmationsQuery = query(collection(db, 'affirmations'));
      const snapshot = await getDocs(affirmationsQuery);
      const loadedAffirmations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Affirmation[];

      setAffirmations(loadedAffirmations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading affirmations:', error);
      setError('Failed to load affirmations');
      setLoading(false);
    }
  };

  const handleDeleteAffirmation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this affirmation?')) return;

    try {
      if (!db) throw new Error('Database not initialized');
      await deleteDoc(doc(db, 'affirmations', id));
      await loadAffirmations();
    } catch (error) {
      console.error('Error deleting affirmation:', error);
      setError('Failed to delete affirmation');
    }
  };

  const filteredAffirmations = affirmations.filter(affirmation => {
    const matchesSearch = 
      getLocalizedContent(affirmation.text).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || affirmation.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || 
      (selectedLanguage === 'en' && affirmation.text.en) ||
      (selectedLanguage === 'es' && affirmation.text.es);
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  if (loading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading affirmations...</div>
      </div>
    );
  }

  if (error || categoriesError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error || categoriesError}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Affirmations Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload size={20} />
            Bulk Import
          </button>
          <button
            onClick={() => setIsAddingAffirmation(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus size={20} />
            Add Affirmation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getLocalizedContent(category.name)}
            </option>
          ))}
        </select>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as 'all' | 'en' | 'es')}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="all">All Languages</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      {/* Affirmations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAffirmations.map((affirmation) => {
          const category = categories.find(c => c.id === affirmation.category);
          
          return (
            <div
              key={affirmation.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircle size={20} className="text-primary" />
                  </div>
                  {category && (
                    <span className="text-sm text-gray-500">
                      {getLocalizedContent(category.name)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingAffirmation(affirmation)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteAffirmation(affirmation.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">English</h3>
                  <p>{affirmation.text.en}</p>
                  {affirmation.images?.en?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {affirmation.images.en.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Spanish</h3>
                  <p>{affirmation.text.es}</p>
                  {affirmation.images?.es?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {affirmation.images.es.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {(isAddingAffirmation || editingAffirmation) && (
        <AffirmationForm
          affirmation={editingAffirmation}
          onClose={() => {
            setIsAddingAffirmation(false);
            setEditingAffirmation(null);
          }}
          onSuccess={() => {
            setIsAddingAffirmation(false);
            setEditingAffirmation(null);
            loadAffirmations();
          }}
          categories={categories}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          isOpen={showBulkImport}
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            setShowBulkImport(false);
            loadAffirmations();
          }}
        />
      )}
    </div>
  );
};

export default Affirmations;