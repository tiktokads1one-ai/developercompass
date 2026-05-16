import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { STALE_THRESHOLD } from '@/hooks/useSession';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Search, RefreshCw, Eye, Repeat2 } from 'lucide-react';

const PAGE_LABELS = {
  '/': 'Home',
  '/trending': 'Trending',
  '/hidden-gems': 'Hidden Gems',
  '/compare': 'Compare',
  '/results': 'Search Results',
};

function getPageLabel(page) {
  if (PAGE_LABELS[page]) return PAGE_LABELS[page];
  if (page.startsWith('/project/')) return decodeURIComponent(page.replace('/project/', ''));
  return page;
}

export default function LiveUsersPanel() {
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await base44.entities.LiveSession.list('-last_heartbeat', 200);
        const cutoff = Date.now() - STALE_THRESHOLD;
        const active = (all || []).filter(s => new Date(s.last_heartbeat).getTime() > cutoff);
        setSessions(active);
      } catch (_) {}
    };

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalOnline = sessions.length;
  const currentPath = window.location.pathname;
  const onThisPage = sessions.filter(s => s.page === currentPath).length;

  // Page breakdown
  const byPage = {};
  sessions.forEach(s => {
    const label = getPageLabel(s.page);
    byPage[label] = (byPage[label] || 0) + 1;
  });

  // Active searches
  const activeSearches = sessions
    .filter(s => s.active_search && s.active_search.trim())
    .map(s => s.active_search)
    .slice(0, 5);

  // Returning vs new
  const returning = sessions.filter(s => s.is_returning).length;
  const newUsers = totalOnline - returning;

  if (totalOnline === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 w-72 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Live Activity</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">Live</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-px bg-border/30 border-b border-border/30">
              <div className="bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">Online now</p>
                <p className="text-2xl font-bold text-foreground">{totalOnline}</p>
              </div>
              <div className="bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">This page</p>
                <p className="text-2xl font-bold text-primary">{onThisPage}</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Returning vs New */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">User type</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <Repeat2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-foreground">{returning} returning</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-foreground">{newUsers} new</span>
                  </div>
                </div>
              </div>

              {/* Pages breakdown */}
              {Object.keys(byPage).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Active pages</p>
                  <div className="space-y-1.5">
                    {Object.entries(byPage)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([label, count]) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Eye className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{label}</span>
                          </div>
                          <span className="text-xs font-medium text-foreground ml-2 shrink-0">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Active searches */}
              {activeSearches.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Live searches</p>
                  <div className="space-y-1.5">
                    {activeSearches.map((q, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Search className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground truncate italic">"{q}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill button */}
      <motion.button
        onClick={() => setExpanded(e => !e)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
        <span className="text-sm font-semibold text-foreground">{totalOnline}</span>
        <span className="text-xs text-muted-foreground">online</span>
        {onThisPage > 0 && (
          <span className="text-xs text-primary font-medium">· {onThisPage} here</span>
        )}
      </motion.button>
    </div>
  );
}