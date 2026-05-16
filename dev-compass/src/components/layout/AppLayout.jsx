import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import LiveUsersPanel from '../live/LiveUsersPanel';
import CommandPalette from '../CommandPalette';
import { useSession } from '@/hooks/useSession';

function SessionTracker() {
  const location = useLocation();
  useSession({ page: location.pathname });
  return null;
}

export default function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault(); setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SessionTracker />
      <Navbar onOpenCmd={() => setCmdOpen(true)} />
      <main className="pt-16">
        <Outlet />
      </main>
      <LiveUsersPanel />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}