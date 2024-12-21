import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Target, Play, Users, MoreHorizontal } from 'lucide-react';

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/read', icon: BookOpen, label: t('nav.read') },
    { to: '/challenges', icon: Target, label: t('nav.challenges') },
    { to: '/videos', icon: Play, label: t('nav.videos') },
    { to: '/community', icon: Users, label: t('nav.community') },
    { to: '/more', icon: MoreHorizontal, label: t('nav.more') }
  ];

  return (
    <nav className={isDesktop ? 'space-y-2' : 'mobile-nav'}>
      <div className={`${isDesktop ? 'flex flex-col gap-2' : 'flex justify-between items-center'}`}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${
              isDesktop ? 'flex-row gap-3 w-full px-4 py-3 rounded-lg' : ''
            }`}
          >
            <Icon size={isDesktop ? 20 : 24} />
            <span className={isDesktop ? 'text-sm' : 'text-xs mt-1'}>
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;