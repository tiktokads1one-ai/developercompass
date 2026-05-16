import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ProjectCard from '../components/projects/ProjectCard';
import { Loader2, Gem, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'DevOps', 'CLI Tools', 'Database', 'Auth', 'Testing', 'AI/ML'];

export default function HiddenGems() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxStars, setMaxStars] = useState(2000);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    loadGems();
  }, [maxStars, category]);

  const loadGems = async () => {
    setLoading(true);
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 10 hidden gem open-source projects that have fewer than ${maxStars} GitHub stars but are high quality and underappreciated.
${category !== 'All' ? `Focus on the "${category}" category.` : 'Cover a variety of categories.'}

These should be REAL projects that exist on GitHub. Focus on:
- Well-maintained but under-discovered
- Solving real problems elegantly
- Good documentation relative to their size
- Active development

For each: name, description, stars (under ${maxStars}), forks, language, license, typescript_support, tags, community_sentiment, star_growth_trend, beginner_friendly, actively_maintained, docs_quality, learning_curve, weekly_downloads, bundle_size_kb (or null), pros (2-3), cons (1-2).`,
      response_json_schema: {
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
                docs_quality: { type: "string" },
                learning_curve: { type: "string" },
                weekly_downloads: { type: "number" },
                bundle_size_kb: { type: "number" },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      },
      add_context_from_internet: true,
    });

    setProjects((data.projects || []).map((p, i) => ({ ...p, id: `gem-${i}` })));
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Gem className="w-5 h-5 text-chart-3" />
          <h1 className="text-2xl font-bold text-foreground">Hidden Gems</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Underappreciated projects that deserve more attention
        </p>
      </div>

      {/* Controls */}
      <div className="p-5 rounded-2xl border border-border bg-card/50 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Max Stars: {maxStars.toLocaleString()}
            </p>
            <Slider
              value={[maxStars]}
              onValueChange={([v]) => setMaxStars(v)}
              min={100}
              max={5000}
              step={100}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>100</span>
              <span>5,000</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Category</p>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Discovering hidden gems…</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-chart-4" />
            <p className="text-sm text-muted-foreground">
              {projects.length} gems found under {maxStars.toLocaleString()} stars
            </p>
          </div>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}