import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell: React.FC = () => {
  return (
    <button 
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Notifications"
    >
      <Bell className="text-gray-600" size={20} />
    </button>
  );
};

export default NotificationBell;