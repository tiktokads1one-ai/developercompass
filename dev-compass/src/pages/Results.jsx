import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SearchBar from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import ProjectCard from '../components/projects/ProjectCard';
import { useSession } from '@/hooks/useSession';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Results() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const query = urlParams.get('q') || '';
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Track active search in live session
  useSession({ page: '/results', activeSearch: query });

  useEffect(() => {
    if (query) performSearch(query);
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    setAiSummary('');

    // Use AI to parse intent and find matching projects
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a developer tools search engine. A user searched for: "${q}"
      
Return a JSON with:
1. "summary": A brief 1-2 sentence explanation of what the user is looking for
2. "parsed_tags": Array of relevant technology tags
3. "projects": Array of 8-12 real open-source projects that match this query. Each project should have:
   - name: project name
   - description: one-line description
   - github_url: GitHub URL
   - stars: approximate star count (number)
   - forks: approximate fork count (number)
   - language: primary language
   - license: license type
   - bundle_size_kb: approximate bundle size in KB (null if not applicable)
   - typescript_support: boolean
   - beginner_friendly: boolean
   - self_hostable: boolean
   - actively_maintained: boolean
   - docs_quality: "excellent", "good", "average", or "poor"
   - learning_curve: "easy", "moderate", or "steep"
   - tags: array of relevant tags
   - community_sentiment: "very_positive", "positive", "mixed", or "negative"
   - star_growth_trend: "rising", "stable", or "declining"
   - weekly_downloads: approximate number
   - pros: array of 2-3 strengths
   - cons: array of 1-2 weaknesses
   - related_projects: array of 2-3 commonly used together project names

Include both popular and lesser-known projects. Prioritize relevance over popularity.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          parsed_tags: { type: "array", items: { type: "string" } },
          projects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                github_url: { type: "string" },
                stars: { type: "number" },
                forks: { type: "number" },
                language: { type: "string" },
                license: { type: "string" },
                bundle_size_kb: { type: "number" },
                typescript_support: { type: "boolean" },
                beginner_friendly: { type: "boolean" },
                self_hostable: { type: "boolean" },
                actively_maintained: { type: "boolean" },
                docs_quality: { type: "string" },
                learning_curve: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                community_sentiment: { type: "string" },
                star_growth_trend: { type: "string" },
                weekly_downloads: { type: "number" },
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                related_projects: { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      },
      add_context_from_internet: true,
    });

    setAiSummary(aiResponse.summary || '');
    setResults((aiResponse.projects || []).map((p, i) => ({ ...p, id: `search-${i}` })));
    setLoading(false);
  };

  const handleSearch = (q) => {
    navigate(`/results?q=${encodeURIComponent(q)}`);
  };

  // Apply filters
  const filteredResults = results.filter(p => {
    if (filters.typescriptSupport && !p.typescript_support) return false;
    if (filters.beginnerFriendly && !p.beginner_friendly) return false;
    if (filters.activelyMaintained && !p.actively_maintained) return false;
    if (filters.selfHostable && !p.self_hostable) return false;
    if (filters.maxStars && filters.maxStars < 100000 && (p.stars || 0) > filters.maxStars) return false;
    if (filters.language && filters.language !== 'Any' && p.language !== filters.language) return false;
    if (filters.license && filters.license !== 'Any' && p.license !== filters.license) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} initialValue={query} />
      </div>

      <div className="mb-6">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Searching the open-source universe…</p>
        </div>
      ) : (
        <>
          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6 flex items-start gap-3"
            >
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground/80">{aiSummary}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
            </p>
          </div>

          <div className="space-y-3">
            {filteredResults.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>

          {filteredResults.length === 0 && !loading && results.length > 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No results match your filters. Try adjusting them.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}