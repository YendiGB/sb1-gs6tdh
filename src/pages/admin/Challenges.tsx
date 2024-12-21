import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Plus, Search, Filter, Target, BarChart } from 'lucide-react';
import type { Challenge } from '../../types/challenge';
import ChallengeForm from '../../components/challenges/ChallengeForm';
import { useLocalization } from '../../hooks/useLocalization'; // <-- Make sure this path is correct

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isAddingChallenge, setIsAddingChallenge] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Our localization hook:
  const { getLocalizedContent } = useLocalization();

  useEffect(() => {
    loadChallenges();
  }, []);

  // -----------------------------------------------------
  // LOAD CHALLENGES
  // -----------------------------------------------------
  const loadChallenges = async () => {
    try {
      if (!db) throw new Error('Database is not initialized');
      const querySnapshot = await getDocs(collection(db, 'challenges'));
      const loadedChallenges = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      setChallenges(loadedChallenges);
      setLoading(false);
    } catch (err) {
      console.error('Error loading challenges:', err);
      setError('Failed to load challenges. Please try again.');
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // SAVE (CREATE or UPDATE)
  // -----------------------------------------------------
  const handleSaveChallenge = async (data: Partial<Challenge>) => {
    try {
      if (!db) throw new Error('Database is not initialized');

      if (editingChallenge) {
        // Update existing challenge
        await updateDoc(doc(db, 'challenges', editingChallenge.id), data);
      } else {
        // Create a new challenge
        await addDoc(collection(db, 'challenges'), data);
      }

      await loadChallenges();
      setIsAddingChallenge(false);
      setEditingChallenge(null);
    } catch (err) {
      console.error('Error saving challenge:', err);
      setError('Failed to save challenge. Please try again.');
    }
  };

  // -----------------------------------------------------
  // DELETE
  // -----------------------------------------------------
  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }
    try {
      if (!db) throw new Error('Database is not initialized');
      await deleteDoc(doc(db, 'challenges', challengeId));
      await loadChallenges();
    } catch (err) {
      console.error('Error deleting challenge:', err);
      setError('Failed to delete challenge. Please try again.');
    }
  };

  // -----------------------------------------------------
  // FILTER CHALLENGES
  // Here we use getLocalizedContent to ensure we're dealing
  // with a plain string during search.
  // -----------------------------------------------------
  const filteredChallenges = challenges.filter(challenge => {
    const localizedTitle = getLocalizedContent(challenge.title);
    // If getLocalizedContent could return something non-string,
    // wrap it in a check or a conversion:
    const safeTitle =
      typeof localizedTitle === 'string'
        ? localizedTitle
        : Object.values(localizedTitle).join('');

    const matchesSearch = safeTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || challenge.category === selectedCategory;

    const matchesDifficulty =
      !selectedDifficulty || challenge.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Challenge Management</h1>
        <button
          onClick={() => setIsAddingChallenge(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus size={20} />
          Add Challenge
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Categories</option>
            <option value="mindfulness">Mindfulness</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
          <select
            value={selectedDifficulty || ''}
            onChange={(e) => setSelectedDifficulty(e.target.value || null)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => {
          const localizedTitle = getLocalizedContent(challenge.title);
          // Convert to string if needed
          const displayTitle =
            typeof localizedTitle === 'string'
              ? localizedTitle
              : Object.values(localizedTitle).join('');

          return (
            <div key={challenge.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{displayTitle}</h3>
                    <p className="text-sm text-gray-500">{challenge.duration} days</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingChallenge(challenge)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <BarChart size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {challenge.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700'
                        : challenge.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                    {challenge.category}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    challenge.published ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {challenge.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Form */}
      {(isAddingChallenge || editingChallenge) && (
        <ChallengeForm
          challenge={editingChallenge}
          onSubmit={handleSaveChallenge}
          onClose={() => {
            setIsAddingChallenge(false);
            setEditingChallenge(null);
          }}
        />
      )}
    </div>
  );
};

export default Challenges;
