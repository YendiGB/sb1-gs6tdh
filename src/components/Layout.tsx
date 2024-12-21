import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const Layout: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isDesktop) {
    return (
      <div className="desktop-layout">
        <aside className="desktop-sidebar">
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
          <Navigation />
        </aside>
        <main className="desktop-main">
          <div className="desktop-content">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <Logo className="h-6" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="pt-14 px-4">
        <div className="max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;