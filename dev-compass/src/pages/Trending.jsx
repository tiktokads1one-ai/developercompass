import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import ProjectCard from '../components/projects/ProjectCard';
import { Loader2, Flame, Zap, Brain, Layout, Server, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

const SECTIONS = [
  {
    id: 'exploding',
    label: '🔥 Exploding This Week',
    icon: Flame,
    color: 'text-chart-5',
    prompt: 'List 6 open-source projects that are exploding in popularity THIS WEEK — fastest growing by GitHub stars, viral on Twitter/X, or just released major versions. Real projects only.',
  },
  {
    id: 'ai',
    label: '🤖 AI Tools',
    icon: Brain,
    color: 'text-chart-3',
    prompt: 'List 6 trending open-source AI/ML tools and libraries from 2024-2025. Focus on LLM frameworks, vector databases, AI agents, model serving, and developer AI tooling.',
  },
  {
    id: 'frontend',
    label: '🎨 Frontend',
    icon: Layout,
    color: 'text-accent',
    prompt: 'List 6 trending open-source frontend tools from 2024-2025: UI libraries, component systems, build tools, state management, animation libraries. Real projects gaining traction.',
  },
  {
    id: 'backend',
    label: '⚙️ Backend',
    icon: Server,
    color: 'text-primary',
    prompt: 'List 6 trending open-source backend tools from 2024-2025: ORMs, web frameworks, auth libraries, databases, API tools, serverless tools. Real projects gaining traction.',
  },
  {
    id: 'radar',
    label: '🔭 Under the Radar',
    icon: Eye,
    color: 'text-chart-4',
    prompt: 'List 6 hidden gem open-source projects — under 2000 GitHub stars but high quality, actively maintained, solving real problems. Not well known but deserve attention.',
  },
];

const PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          stars: { type: "number" },
          forks: { type: "number" },
          language: { type: "string" },
          license: { type: "string" },
          typescript_support: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
          community_sentiment: { type: "string" },
          star_growth_trend: { type: "string" },
          beginner_friendly: { type: "boolean" },
          actively_maintained: { type: "boolean" },
          weekly_downloads: { type: "number" },
          bundle_size_kb: { type: "number" },
          contributors: { type: "number" },
          avg_issue_response_hours: { type: "number" },
        }
      }
    }
  }
};

function getCacheKey(id) { return `oss_trending_${id}`; }

function getFromCache(id) {
  try {
    const raw = localStorage.getItem(getCacheKey(id));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCache(id, data) {
  try {
    localStorage.setItem(getCacheKey(id), JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function TrendingSection({ section, forceRefresh }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (bust = false) => {
    setLoading(true);
    if (!bust) {
      const cached = getFromCache(section.id);
      if (cached) { setProjects(cached); setLoading(false); return; }
    }
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: section.prompt + `\n\nFor each include: name, description, stars, forks, language, license, typescript_support, tags, community_sentiment, star_growth_trend, beginner_friendly, actively_maintained, weekly_downloads, bundle_size_kb, contributors, avg_issue_response_hours.`,
      response_json_schema: PROJECT_SCHEMA,
      add_context_from_internet: true,
    });
    const list = (data.projects || []).map((p, i) => ({ ...p, id: `${section.id}-${i}` }));
    setCache(section.id, list);
    setProjects(list);
    setLoading(false);
  }, [section]);

  useEffect(() => { load(forceRefresh > 0); }, [forceRefresh]);

  const Icon = section.icon;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${section.color}`} />
        <h2 className="text-lg font-bold text-foreground">{section.label}</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-10 justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function Trending() {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    SECTIONS.forEach(s => localStorage.removeItem(getCacheKey(s.id)));
    setForceRefresh(r => r + 1);
    setLastRefresh(new Date());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Trending Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Curated by AI · refreshes daily · last updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {SECTIONS.map(section => (
        <TrendingSection key={section.id} section={section} forceRefresh={forceRefresh} />
      ))}
    </div>
  );
}