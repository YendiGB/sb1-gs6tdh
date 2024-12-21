import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface NotificationPreferences {
  challengeReminders: boolean;
  nextDayAlerts: boolean;
  dailyTime?: string; // HH:mm format
}

export function useNotifications(userId?: string) {
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    challengeReminders: false,
    nextDayAlerts: false
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  const loadPreferences = async () => {
    if (!db || !userId) return;
    
    try {
      const prefsDoc = await getDoc(doc(db, 'users', userId, 'preferences', 'notifications'));
      if (prefsDoc.exists()) {
        setPreferences(prefsDoc.data() as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    return permission;
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!db || !userId) return;

    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      await setDoc(
        doc(db, 'users', userId, 'preferences', 'notifications'),
        updatedPrefs,
        { merge: true }
      );
      setPreferences(updatedPrefs);

      // If enabling notifications, request permission
      if ((newPrefs.challengeReminders || newPrefs.nextDayAlerts) && notificationStatus === 'default') {
        await requestPermission();
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  };

  const scheduleNotification = async (challengeId: string, nextDay: number, time?: string) => {
    if (!db || !userId || notificationStatus !== 'granted') return;

    try {
      await setDoc(
        doc(db, 'notifications', `${userId}_${challengeId}_day${nextDay}`),
        {
          userId,
          challengeId,
          day: nextDay,
          scheduledFor: time || '09:00',
          status: 'scheduled'
        }
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  return {
    notificationStatus,
    preferences,
    requestPermission,
    updatePreferences,
    scheduleNotification
  };
}