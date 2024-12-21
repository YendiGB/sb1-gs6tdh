import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useChallenges } from '../../hooks/useChallenges';
import { useTranslation } from 'react-i18next';
import ChallengeCard from '../challenges/ChallengeCard';

const ActiveChallenges: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuthStore();
  const { challenges, loading, error } = useChallenges({ 
    userId: userData?.id,
    onlyActive: true,
    onlyPublished: false // Show all active challenges, even if unpublished
  });

  if (loading || !userData) return null;
  if (error) return null;
  if (!challenges.length) return null;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t('home.challenges.title')}</h2>
        <Link 
          to="/challenges"
          className="text-primary flex items-center gap-1 text-sm font-medium hover:text-primary/80 transition-colors"
        >
          {t('home.challenges.viewAll')}
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-4">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            to={`/challenges/${challenge.id}`}
            className="snap-start shrink-0 w-[200px]"
          >
            <ChallengeCard
              challenge={challenge}
              progress={challenge.progress}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActiveChallenges;