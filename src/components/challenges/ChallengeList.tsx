import React from 'react';
import { Link } from 'react-router-dom';
import type { Challenge } from '../../types/challenge';
import ChallengeCard from './ChallengeCard';

interface ChallengeListProps {
  challenges: Challenge[];
  onSelectChallenge?: (challenge: Challenge) => void;
  showProgress?: boolean;
  isActive?: boolean;
}

const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  onSelectChallenge,
  showProgress = false,
  isActive = false
}) => {
  if (!challenges.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No challenges available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {challenges.map((challenge) => (
        isActive ? (
          <Link key={challenge.id} to={`/challenges/${challenge.id}`}>
            <ChallengeCard
              challenge={challenge}
              progress={challenge.progress}
            />
          </Link>
        ) : (
          <div key={challenge.id}>
            <ChallengeCard
              challenge={challenge}
              onClick={() => onSelectChallenge?.(challenge)}
              showJoinButton={true}
            />
          </div>
        )
      ))}
    </div>
  );
};

export default ChallengeList;