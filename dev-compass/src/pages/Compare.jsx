import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GitCompare, Plus, X, Loader2, Star, GitFork, Users, Download,
  Clock, Package, BookOpen, Gauge, Shield, CheckCircle, XCircle, Share2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetricRow = ({ label, values, type = 'text' }) => (
  <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}>
    <div className="text-sm text-muted-foreground py-3 px-2">{label}</div>
    {values.map((v, i) => (
      <div key={i} className="text-sm text-foreground py-3 px-3 rounded-lg bg-secondary/20 text-center">
        {type === 'boolean' ? (
          v ? <CheckCircle className="w-4 h-4 text-primary mx-auto" /> : <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
        ) : type === 'number' ? (
          <span className="font-mono font-medium">{(v || 0).toLocaleString()}</span>
        ) : (
          <span className="capitalize">{v || 'N/A'}</span>
        )}
      </div>
    ))}
  </div>
);

const ListRow = ({ label, values }) => (
  <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}>
    <div className="text-sm text-muted-foreground py-3 px-2">{label}</div>
    {values.map((list, i) => (
      <div key={i} className="py-3 px-3 rounded-lg bg-secondary/20">
        <ul className="space-y-1">
          {(list || []).map((item, j) => (
            <li key={j} className="text-xs text-foreground/80 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-primary/50">
              {item}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default function Compare() {
  const [projectNames, setProjectNames] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('projects');
    return p ? p.split(',').map(s => s.trim()) : ['', ''];
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);

  const addProject = () => {
    if (projectNames.length < 5) {
      setProjectNames([...projectNames, '']);
    }
  };

  const removeProject = (index) => {
    if (projectNames.length > 2) {
      setProjectNames(projectNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index, value) => {
    const updated = [...projectNames];
    updated[index] = value;
    setProjectNames(updated);
  };

  const runComparison = async () => {
    const names = projectNames.filter(n => n.trim());
    if (names.length < 2) return;

    setLoading(true);
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare these open-source projects side by side: ${names.join(', ')}

For each project provide:
- name, description, stars, forks, contributors, weekly_downloads
- language, license, bundle_size_kb (or null)
- typescript_support (bool), beginner_friendly (bool), self_hostable (bool), actively_maintained (bool)
- docs_quality (excellent/good/average/poor)
- learning_curve (easy/moderate/steep)
- deployment_difficulty (easy/moderate/hard)
- avg_issue_response_hours (number)
- setup_time_minutes (number, approximate)
- pros (array of 3 strings)
- cons (array of 2 strings)
- community_sentiment (very_positive/positive/mixed/negative)
- best_for (one line: what use case it's best for)

Also provide a "verdict" string (2-3 sentences comparing them overall).`,
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
                contributors: { type: "number" },
                weekly_downloads: { type: "number" },
                language: { type: "string" },
                license: { type: "string" },
                bundle_size_kb: { type: "number" },
                typescript_support: { type: "boolean" },
                beginner_friendly: { type: "boolean" },
                self_hostable: { type: "boolean" },
                actively_maintained: { type: "boolean" },
                docs_quality: { type: "string" },
                learning_curve: { type: "string" },
                deployment_difficulty: { type: "string" },
                avg_issue_response_hours: { type: "number" },
                setup_time_minutes: { type: "number" },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                community_sentiment: { type: "string" },
                best_for: { type: "string" },
              }
            }
          },
          verdict: { type: "string" }
        }
      },
      add_context_from_internet: true,
    });

    setResults(data);
    setLoading(false);
    // Update URL for shareability
    const filteredNames = projectNames.filter(n => n.trim());
    const url = new URL(window.location.href);
    url.searchParams.set('projects', filteredNames.join(','));
    window.history.replaceState({}, '', url.toString());
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const projects = results?.projects || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="w-5 h-5 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Compare Tools</h1>
        </div>
        <p className="text-sm text-muted-foreground">Side-by-side comparison on what actually matters</p>
      </div>

      {/* Input area */}
      <div className="p-5 rounded-2xl border border-border bg-card/50 mb-8">
        <div className="flex flex-wrap gap-3 mb-4">
          {projectNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Project ${i + 1}`}
                className="w-48 bg-secondary border-border"
              />
              {projectNames.length > 2 && (
                <button onClick={() => removeProject(i)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {projectNames.length < 5 && (
            <button
              onClick={addProject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={runComparison}
            disabled={loading || projectNames.filter(n => n.trim()).length < 2}
            className="bg-primary text-primary-foreground"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GitCompare className="w-4 h-4 mr-2" />}
            Compare
          </Button>
          {results && (
            <Button variant="outline" onClick={shareLink} className="gap-2">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verdict */}
            {results.verdict && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground/80">{results.verdict}</p>
              </div>
            )}

            {/* Header row */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${projects.length}, 1fr)` }}>
              <div />
              {projects.map((p, i) => (
                <div key={i} className="text-center p-4 rounded-xl border border-border bg-card/80">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                  {p.best_for && (
                    <Badge className="mt-2 bg-primary/10 text-primary border-0 text-xs">{p.best_for}</Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl border border-border bg-card/30 p-5 space-y-2 overflow-x-auto">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Popularity</p>
              <MetricRow label="Stars" values={projects.map(p => p.stars)} type="number" />
              <MetricRow label="Forks" values={projects.map(p => p.forks)} type="number" />
              <MetricRow label="Contributors" values={projects.map(p => p.contributors)} type="number" />
              <MetricRow label="Weekly Downloads" values={projects.map(p => p.weekly_downloads)} type="number" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-3">Technical</p>
              <MetricRow label="Language" values={projects.map(p => p.language)} />
              <MetricRow label="License" values={projects.map(p => p.license)} />
              <MetricRow label="Bundle Size (kb)" values={projects.map(p => p.bundle_size_kb)} type="number" />
              <MetricRow label="TypeScript" values={projects.map(p => p.typescript_support)} type="boolean" />
              <MetricRow label="Self-Hostable" values={projects.map(p => p.self_hostable)} type="boolean" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-3">Developer Experience</p>
              <MetricRow label="Docs Quality" values={projects.map(p => p.docs_quality)} />
              <MetricRow label="Learning Curve" values={projects.map(p => p.learning_curve)} />
              <MetricRow label="Deploy Difficulty" values={projects.map(p => p.deployment_difficulty)} />
              <MetricRow label="Setup Time (min)" values={projects.map(p => p.setup_time_minutes)} type="number" />
              <MetricRow label="Avg Issue Response" values={projects.map(p => `${p.avg_issue_response_hours || '?'}h`)} />
              <MetricRow label="Beginner Friendly" values={projects.map(p => p.beginner_friendly)} type="boolean" />
              <MetricRow label="Active Maintenance" values={projects.map(p => p.actively_maintained)} type="boolean" />
              <MetricRow label="Sentiment" values={projects.map(p => p.community_sentiment?.replace('_', ' '))} />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-3">Opinions</p>
              <ListRow label="Pros" values={projects.map(p => p.pros)} />
              <ListRow label="Cons" values={projects.map(p => p.cons)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!results && !loading && (
        <div className="text-center py-20">
          <GitCompare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Enter at least 2 project names and click Compare</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Example: Auth.js, Clerk, Lucia</p>
        </div>
      )}
    </div>
  );
}