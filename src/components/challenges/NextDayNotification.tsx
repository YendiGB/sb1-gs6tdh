import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';

interface NextDayNotificationProps {
  challengeId: string;
  nextDay: number;
  currentProgress: number;
}

const NextDayNotification: React.FC<NextDayNotificationProps> = ({
  challengeId,
  nextDay,
  currentProgress
}) => {
  const { userData } = useAuthStore();
  const { 
    notificationStatus,
    preferences,
    updatePreferences,
    scheduleNotification
  } = useNotifications(userData?.id);
  const [loading, setLoading] = useState(false);

  const handleToggleNotifications = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      // Update user preferences
      await updatePreferences({
        nextDayAlerts: !preferences.nextDayAlerts
      });

      // Schedule notification if enabling
      if (!preferences.nextDayAlerts) {
        await scheduleNotification(challengeId, nextDay);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilTomorrow = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="bg-primary/5 rounded-xl p-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {preferences.nextDayAlerts ? (
          <Bell size={24} className="text-primary" />
        ) : (
          <BellOff size={24} className="text-gray-400" />
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {currentProgress === 100 ? 'Ready for Tomorrow!' : 'Come Back Tomorrow'}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {currentProgress === 100 ? (
          `Great job completing today's tasks! Next day's challenges will be available in ${getTimeUntilTomorrow()}.`
        ) : (
          "You still have tasks to complete today. Come back tomorrow to continue your journey."
        )}
      </p>

      <button
        onClick={handleToggleNotifications}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg transition-colors ${
          preferences.nextDayAlerts
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {preferences.nextDayAlerts ? (
          <>
            <Bell size={20} />
            Notifications Enabled
          </>
        ) : (
          <>
            <BellOff size={20} />
            Enable Notifications
          </>
        )}
      </button>

      {notificationStatus === 'denied' && (
        <p className="text-sm text-red-600 mt-2">
          Please enable notifications in your browser settings to receive alerts.
        </p>
      )}
    </div>
  );
};

export default NextDayNotification;