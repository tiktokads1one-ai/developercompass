import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch, large = false, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const suggestions = [
    "I need authentication for Next.js with social login",
    "Lightweight chart library under 20kb",
    "Redis alternative for local development",
    "Open-source alternatives to Firebase",
    "React animation library with spring physics",
    "Fast image processing in Python",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    onSearch(s);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
            focused
              ? 'border-primary/40 glow-green bg-card'
              : 'border-border bg-card/50'
          } ${large ? 'p-2' : 'p-1.5'}`}
        >
          <div className={`flex items-center justify-center ${large ? 'pl-4' : 'pl-3'}`}>
            <Sparkles className={`${large ? 'w-5 h-5' : 'w-4 h-4'} text-primary`} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Describe what you need..."
            className={`flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground/50 ${
              large ? 'text-lg px-4 py-3' : 'text-sm px-3 py-2'
            }`}
          />
          <button
            type="submit"
            className={`flex items-center gap-2 bg-primary text-primary-foreground font-medium rounded-xl transition-all hover:bg-primary/90 ${
              large ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'
            }`}
          >
            <Search className={large ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {large && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {suggestions.slice(0, 4).map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => handleSuggestion(s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <ArrowRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{s}</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}