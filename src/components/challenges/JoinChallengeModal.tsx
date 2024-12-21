import React from 'react';
import { X, Target, Lock } from 'lucide-react';
import type { Challenge } from '../../types/challenge';

interface JoinChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  userMembership: 'free' | 'premium' | 'unlimited';
  onJoin: () => Promise<void>;
}

const JoinChallengeModal: React.FC<JoinChallengeModalProps> = ({
  isOpen,
  onClose,
  challenge,
  userMembership,
  onJoin
}) => {
  if (!isOpen) return null;

  const canAccess = challenge.membershipAccess.includes(userMembership);
  const requiresUpgrade = !canAccess && challenge.membershipAccess.some(level => 
    (level === 'premium' && userMembership === 'free') ||
    (level === 'unlimited' && (userMembership === 'free' || userMembership === 'premium'))
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Join Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {challenge.thumbnail ? (
              <img
                src={challenge.thumbnail}
                alt={challenge.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target size={24} className="text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{challenge.title}</h3>
              <p className="text-sm text-gray-500">{challenge.duration} days</p>
            </div>
          </div>

          {canAccess ? (
            <>
              <p className="text-gray-600 mb-6">
                Are you ready to start this challenge? You'll receive daily tasks and guidance
                throughout your journey.
              </p>
              <button
                onClick={onJoin}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Start Challenge
              </button>
            </>
          ) : requiresUpgrade ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Membership Required</h3>
              <p className="text-gray-600 mb-6">
                This challenge requires a {challenge.membershipAccess[0]} membership.
                Upgrade your account to access this and many other challenges.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Upgrade Membership
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Purchase Required</h3>
              <p className="text-gray-600 mb-4">
                This challenge is available for purchase.
              </p>
              <div className="text-2xl font-bold text-primary mb-6">
                ${challenge.price}
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Purchase Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinChallengeModal;