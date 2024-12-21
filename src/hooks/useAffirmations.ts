import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Affirmation, AffirmationCategory, UserAffirmationPreferences } from '../types/affirmation';

interface UseAffirmationsOptions {
  userId?: string;
}

export function useAffirmations({ userId }: UseAffirmationsOptions = {}) {
  const [dailyAffirmation, setDailyAffirmation] = useState<Affirmation | null>(null);
  const [categories, setCategories] = useState<AffirmationCategory[]>([]);
  const [preferences, setPreferences] = useState<UserAffirmationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && preferences) {
      loadDailyAffirmation();
    }
  }, [userId, preferences]);

  const loadCategories = async () => {
    try {
      if (!db) throw new Error('Database not initialized');

      const categoriesSnapshot = await getDocs(collection(db, 'affirmationCategories'));
      const loadedCategories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AffirmationCategory[];

      setCategories(loadedCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load affirmation categories');
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      if (!db || !userId) return;

      const prefsDoc = await getDoc(doc(db, 'users', userId, 'preferences', 'affirmations'));
      if (prefsDoc.exists()) {
        setPreferences(prefsDoc.data() as UserAffirmationPreferences);
      } else {
        // Create default preferences
        const defaultPrefs: UserAffirmationPreferences = {
          userId,
          selectedCategories: categories.map(c => c.id),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', userId, 'preferences', 'affirmations'), defaultPrefs);
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setError('Failed to load affirmation preferences');
    }
  };

  const loadDailyAffirmation = async () => {
    try {
      if (!db || !userId || !preferences?.selectedCategories.length) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Check if we need a new affirmation
      if (preferences.lastAffirmationDate !== today) {
        // Get all affirmations from selected categories
        const affirmationsQuery = query(
          collection(db, 'affirmations'),
          where('category', 'in', preferences.selectedCategories)
        );
        
        const affirmationsSnapshot = await getDocs(affirmationsQuery);
        const affirmations = affirmationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Affirmation[];

        if (affirmations.length > 0) {
          // Filter out last shown affirmation
          const availableAffirmations = affirmations.filter(a => 
            a.id !== preferences.lastAffirmationId
          );

          // Select random affirmation
          const randomIndex = Math.floor(Math.random() * availableAffirmations.length);
          const selectedAffirmation = availableAffirmations[randomIndex] || affirmations[0];

          // Update preferences with new affirmation
          const updatedPrefs = {
            ...preferences,
            lastAffirmationDate: today,
            lastAffirmationId: selectedAffirmation.id,
            updatedAt: new Date().toISOString()
          };

          await setDoc(
            doc(db, 'users', userId, 'preferences', 'affirmations'),
            updatedPrefs
          );

          setPreferences(updatedPrefs);
          setDailyAffirmation(selectedAffirmation);
        }
      } else if (preferences.lastAffirmationId) {
        // Load current day's affirmation
        const affirmationDoc = await getDoc(
          doc(db, 'affirmations', preferences.lastAffirmationId)
        );
        
        if (affirmationDoc.exists()) {
          setDailyAffirmation({
            id: affirmationDoc.id,
            ...affirmationDoc.data()
          } as Affirmation);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading daily affirmation:', error);
      setError('Failed to load daily affirmation');
      setLoading(false);
    }
  };

  const updatePreferences = async (categoryIds: string[]) => {
    try {
      if (!db || !userId) return;

      const updatedPrefs: UserAffirmationPreferences = {
        ...preferences,
        userId,
        selectedCategories: categoryIds,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userId, 'preferences', 'affirmations'), updatedPrefs);
      setPreferences(updatedPrefs);
      await loadDailyAffirmation();
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences');
    }
  };

  return {
    dailyAffirmation,
    categories,
    preferences,
    loading,
    error,
    updatePreferences,
    refreshAffirmation: loadDailyAffirmation
  };
}