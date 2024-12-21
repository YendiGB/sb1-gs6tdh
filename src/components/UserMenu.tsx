import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        <img
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces"
          alt="Profile"
          className="w-full h-full rounded-full object-cover"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-50"
        >
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profile');
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <User size={16} />
            {t('profile.title')}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/settings');
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Settings size={16} />
            {t('settings.title')}
          </button>
          <hr className="my-1" />
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut size={16} />
            {t('profile.signOut')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;