import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Any'];
const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'Any'];

export default function FilterPanel({ filters, setFilters, open, onToggle }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (typeof v === 'boolean') return v;
    if (k === 'maxStars') return v < 100000;
    if (k === 'license' || k === 'language') return v !== 'Any';
    return false;
  }).length;

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <Badge className="bg-primary/20 text-primary border-0 text-xs px-1.5 py-0">
            {activeCount}
          </Badge>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Smart Filters</h3>
                <button
                  onClick={onToggle}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Toggle filters */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Qualities</p>
                  {[
                    { key: 'typescriptSupport', label: 'TypeScript support' },
                    { key: 'beginnerFriendly', label: 'Beginner-friendly' },
                    { key: 'activelyMaintained', label: 'Actively maintained' },
                    { key: 'selfHostable', label: 'Self-hostable' },
                    { key: 'privacyFocused', label: 'Privacy-focused' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80">{label}</span>
                      <Switch
                        checked={filters[key] || false}
                        onCheckedChange={(v) => updateFilter(key, v)}
                      />
                    </div>
                  ))}
                </div>

                {/* Selects */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Language</p>
                    <Select value={filters.language || 'Any'} onValueChange={(v) => updateFilter('language', v)}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">License</p>
                    <Select value={filters.license || 'Any'} onValueChange={(v) => updateFilter('license', v)}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSES.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Star threshold */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Max Stars: {(filters.maxStars || 100000).toLocaleString()}
                    </p>
                    <Slider
                      value={[filters.maxStars || 100000]}
                      onValueChange={([v]) => updateFilter('maxStars', v)}
                      min={100}
                      max={100000}
                      step={100}
                      className="mt-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>100</span>
                      <span>100k+</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Docs Quality</p>
                    <Select value={filters.docsQuality || 'any'} onValueChange={(v) => updateFilter('docsQuality', v)}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}