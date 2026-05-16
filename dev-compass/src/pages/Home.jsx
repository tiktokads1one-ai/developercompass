import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/search/SearchBar';
import { Zap, Eye, Shield, GitCompare, TrendingUp, Users } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Intent-Based Search', desc: 'Describe your problem, not a keyword. AI finds the right tools.' },
  { icon: Eye, title: 'Hidden Gems', desc: 'Discover amazing projects under 2k stars that most miss.' },
  { icon: Shield, title: 'Smart Filters', desc: 'Filter by TS support, bundle size, license, docs quality & more.' },
  { icon: GitCompare, title: 'Side-by-Side Compare', desc: 'Compare tools on setup time, bundle size, maintenance & more.' },
  { icon: TrendingUp, title: 'Trend Intelligence', desc: 'Track star velocity, commit activity & maintainer health.' },
  { icon: Users, title: 'Community Voice', desc: 'Real developer opinions aggregated from Reddit & forums.' },
];

export default function Home() {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate(`/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(142,72%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(142,72%,50%) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 pt-28 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-8">
              <Zap className="w-3 h-3" />
              AI-Powered Discovery
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Find tools based on
              <br />
              <span className="text-gradient">problems, not popularity</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Describe what you need in plain English. Our AI matches you with the best 
              open-source tools — including hidden gems you'd never find on "Top 10" lists.
            </p>

            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} large />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-5 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-primary/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50k+', label: 'Projects indexed' },
              { value: '2.4M', label: 'Monthly searches' },
              { value: '12k', label: 'Hidden gems found' },
              { value: '98%', label: 'Relevance score' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <p className="text-2xl md:text-3xl font-bold text-gradient">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}