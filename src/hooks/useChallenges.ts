import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Challenge } from '../types/challenge';

interface UseChallengesOptions {
  userId?: string;
  onlyPublished?: boolean;
  onlyActive?: boolean;
}

export function useChallenges({ 
  userId, 
  onlyPublished = true,
  onlyActive = false 
}: UseChallengesOptions = {}) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [userId, onlyPublished, onlyActive]);

  const loadChallenges = async () => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }

      // First, get all published challenges
      const challengesQuery = query(
        collection(db, 'challenges'),
        ...(onlyPublished ? [where('published', '==', true)] : [])
      );

      const challengesSnapshot = await getDocs(challengesQuery);
      const allChallenges = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];

      // If we need active challenges and have a userId, get the progress data
      if (userId) {
        try {
          const progressQuery = query(
            collection(db, 'challengeProgress'),
            where('userId', '==', userId),
            where('status', '==', 'active')
          );
          const progressSnapshot = await getDocs(progressQuery);
          const activeIds = new Set(progressSnapshot.docs.map(doc => doc.data().challengeId));

          // Filter challenges based on active status
          const filteredChallenges = allChallenges.filter(challenge => 
            onlyActive ? activeIds.has(challenge.id) : !activeIds.has(challenge.id)
          );

          // Add progress data to active challenges
          if (onlyActive) {
            const challengesWithProgress = filteredChallenges.map(challenge => {
              const progressDoc = progressSnapshot.docs.find(
                doc => doc.data().challengeId === challenge.id
              );
              if (!progressDoc) return challenge;

              const progressData = progressDoc.data();
              return {
                ...challenge,
                progress: {
                  currentDay: progressData.currentDay,
                  completedTasks: progressData.completedTasks,
                  status: progressData.status
                }
              };
            });
            setChallenges(challengesWithProgress);
          } else {
            setChallenges(filteredChallenges);
          }
        } catch (progressError) {
          console.error('Error loading challenge progress:', progressError);
          // If we fail to load progress, fall back to showing all challenges
          setChallenges(allChallenges);
        }
      } else {
        setChallenges(allChallenges);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setError(error instanceof Error ? error.message : 'Failed to load challenges');
      setLoading(false);
    }
  };

  const refreshChallenges = () => {
    setLoading(true);
    loadChallenges();
  };

  return {
    challenges,
    loading,
    error,
    refreshChallenges
  };
}