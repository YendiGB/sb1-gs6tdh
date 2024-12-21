import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Challenge } from '../types/challenge';
import { useChallenges } from '../hooks/useChallenges';
import ChallengeList from '../components/challenges/ChallengeList';
import ChallengeFilters from '../components/ChallengeFilters';
import JoinChallengeModal from '../components/challenges/JoinChallengeModal';
import { useLocalization } from '../hooks/useLocalization';

/** 
 * Helper to ensure that whatever we get is returned as a plain string. 
 * If `value` is already a string, great. 
 * If it's an object (multi-language, etc.), 
 * we pick a fallback or join values to get a single string.
 */
function asSafeString(value: any): string {
  if (typeof value === 'string') {
    return value;
  } 
  if (value && typeof value === 'object') {
    // If you store localized fields like { en: "Title", es: "Título" },
    // pick the current language or just join them:
    // return value.en ?? Object.values(value).join('');  // or a language fallback
    return Object.values(value).join(''); 
  }
  return ''; 
}

const Challenges: React.FC = () => {
  const { t } = useTranslation();
  const { getLocalizedContent } = useLocalization();
  const { userData } = useAuthStore();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // ------------- LOAD CHALLENGES -------------
  const { 
    challenges: activeChallenges, 
    loading: activeLoading 
  } = useChallenges({ 
    userId: userData?.id, 
    onlyActive: true 
  });

  const { 
    challenges: availableChallenges, 
    loading: availableLoading,
    error,
    refreshChallenges
  } = useChallenges({ 
    userId: userData?.id, 
    onlyActive: false 
  });

  // ------------- JOIN CHALLENGE -------------
  const handleJoinChallenge = async () => {
    // ... existing join challenge logic ...
    refreshChallenges();
  };

  // ------------- LOADING / ERROR STATES -------------
  if (activeLoading || availableLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  // ------------- FILTERING CHALLENGES -------------
  const filteredChallenges = availableChallenges.filter((challenge) => {
    // 1) Get the localized title from your hook
    const rawTitle = getLocalizedContent(challenge.title);
    // 2) Safely convert it to a string
    const safeTitle = asSafeString(rawTitle).toLowerCase();
    // 3) Check the search
    return safeTitle.includes(searchQuery.toLowerCase());
  });

  // ------------- RENDER -------------
  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">{t('challenges.title')}</h1>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('challenges.active')}</h2>
          <ChallengeList
            challenges={activeChallenges}
            showProgress={true}
            isActive={true}
          />
        </section>
      )}

      {/* Challenge Catalog */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('challenges.discover')}</h2>
          
          {/* Search and Filter Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('challenges.search') || ''}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>

          <ChallengeList
            challenges={filteredChallenges}
            onSelectChallenge={setSelectedChallenge}
          />
        </div>
      </section>

      <ChallengeFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {selectedChallenge && (
        <JoinChallengeModal
          isOpen={true}
          onClose={() => setSelectedChallenge(null)}
          challenge={selectedChallenge}
          userMembership={userData?.membershipType || 'free'}
          onJoin={handleJoinChallenge}
        />
      )}
    </div>
  );
};

export default Challenges;
