import React from 'react';
import { Target } from 'lucide-react';
import type { Challenge } from '../../types/challenge';
import { useLocalization } from '../../hooks/useLocalization';

interface ChallengeCardProps {
  challenge: Challenge;
  onClick?: () => void;
  showJoinButton?: boolean;
  progress?: {
    currentDay: number;
    completedTasks: string[];
    status: 'active' | 'completed' | 'abandoned';
  };
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onClick,
  showJoinButton = false,
  progress
}) => {
  const { getLocalizedContent } = useLocalization();
  const title = getLocalizedContent(challenge.title);
  const description = getLocalizedContent(challenge.description);

  return (
    <div
      className={`bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all h-full ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="aspect-square rounded-lg bg-primary/5 mb-3 relative overflow-hidden">
        {challenge.thumbnail ? (
          <img
            src={challenge.thumbnail}
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <Target size={32} className="text-primary mb-2" />
            <div className="text-center">
              <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
              <p className="text-xs text-gray-500">{challenge.duration} days</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
            challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {challenge.difficulty}
          </span>
          <span className="text-gray-500">{challenge.duration} days</span>
        </div>
      </div>
      
      {progress && (
        <div className="mt-3">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ 
                width: `${(progress.currentDay / challenge.duration) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Day {progress.currentDay} of {challenge.duration}
          </p>
        </div>
      )}

      {showJoinButton && (
        <button className="w-full py-2 mt-4 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
          Join Challenge
        </button>
      )}
    </div>
  );
};

export default ChallengeCard;