import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Compass, TrendingUp, Gem, GitCompare,
  Clock, ArrowRight, Hash, Keyboard
} from 'lucide-react';

const STATIC_COMMANDS = [
  { id: 'home', label: 'Go to Discover', icon: Compass, path: '/', group: 'Navigate' },
  { id: 'trending', label: 'Go to Trending', icon: TrendingUp, path: '/trending', group: 'Navigate' },
  { id: 'gems', label: 'Go to Hidden Gems', icon: Gem, path: '/hidden-gems', group: 'Navigate' },
  { id: 'compare', label: 'Compare Tools', icon: GitCompare, path: '/compare', group: 'Navigate' },
];

const SUGGESTIONS = [
  'authentication with social login',
  'React state management',
  'fast image processing',
  'open-source Firebase alternative',
  'lightweight chart library',
  'TypeScript ORM',
];

function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem('oss_recently_viewed') || '[]'); } catch { return []; }
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? onClose() : null; }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const recentlyViewed = getRecentlyViewed();

  const filteredCommands = STATIC_COMMANDS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRecent = recentlyViewed.filter(item =>
    !query || item.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/results?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleCommand = (path) => {
    navigate(path);
    onClose();
  };

  const handleProject = (name) => {
    navigate(`/project/${encodeURIComponent(name)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search projects or navigate…"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">
                  esc
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto py-2">
                {/* Search action */}
                {query && (
                  <div className="px-2 mb-1">
                    <button
                      onClick={handleSearch}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-left group"
                    >
                      <Search className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground flex-1">Search for "<span className="text-primary font-medium">{query}</span>"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                    </button>
                  </div>
                )}

                {/* Recently viewed */}
                {filteredRecent.length > 0 && (
                  <div className="px-2 mb-2">
                    <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Recently Viewed</p>
                    {filteredRecent.map(item => (
                      <button
                        key={item.name}
                        onClick={() => handleProject(item.name)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 text-left group"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground flex-1">{item.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Nav commands */}
                {filteredCommands.length > 0 && (
                  <div className="px-2 mb-2">
                    <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Navigate</p>
                    {filteredCommands.map(cmd => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleCommand(cmd.path)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 text-left group"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground flex-1">{cmd.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Suggestions */}
                {!query && (
                  <div className="px-2">
                    <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Suggestions</p>
                    {SUGGESTIONS.slice(0, 3).map(s => (
                      <button
                        key={s}
                        onClick={() => { navigate(`/results?q=${encodeURIComponent(s)}`); onClose(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 text-left group"
                      >
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground flex-1">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground/50">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary">↵</kbd> search</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary">esc</kbd> close</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-secondary">⌘K</kbd> toggle</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}