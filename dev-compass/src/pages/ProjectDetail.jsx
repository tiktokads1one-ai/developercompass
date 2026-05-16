import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TrendChart from '../components/projects/TrendChart';

import CommunityInsights from '../components/projects/CommunityInsights';
import StatBadge from '../components/projects/StatBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star, GitFork, Users, Clock, ArrowLeft, ExternalLink,
  FileText, Download, Shield, BookOpen, Gauge, Package, Activity
} from 'lucide-react';
import HealthScore from '../components/projects/HealthScore';
import EcosystemGraph from '../components/projects/EcosystemGraph';
import InstallCommand from '../components/projects/InstallCommand';
import { addRecentlyViewed } from '../hooks/useRecentlyViewed';
import { motion } from 'framer-motion';

export default function ProjectDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const projectName = decodeURIComponent(pathParts[pathParts.length - 1] || '') || urlParams.get('name') || '';
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    if (projectName) loadProject(projectName);
  }, [projectName]);

  const loadProject = async (name) => {
    setLoading(true);
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide detailed information about the open-source project "${name}". Return comprehensive data about this project.

Generate realistic monthly star growth data for the last 12 months as "trend_data" array with objects {date: "Mon YYYY", value: number}.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          full_description: { type: "string" },
          github_url: { type: "string" },
          website_url: { type: "string" },
          npm_package: { type: "string" },
          stars: { type: "number" },
          forks: { type: "number" },
          open_issues: { type: "number" },
          language: { type: "string" },
          license: { type: "string" },
          bundle_size_kb: { type: "number" },
          typescript_support: { type: "boolean" },
          beginner_friendly: { type: "boolean" },
          self_hostable: { type: "boolean" },
          privacy_focused: { type: "boolean" },
          actively_maintained: { type: "boolean" },
          docs_quality: { type: "string" },
          learning_curve: { type: "string" },
          deployment_difficulty: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          related_projects: { type: "array", items: { type: "string" } },
          pros: { type: "array", items: { type: "string" } },
          cons: { type: "array", items: { type: "string" } },
          community_sentiment: { type: "string" },
          star_growth_trend: { type: "string" },
          weekly_downloads: { type: "number" },
          contributors: { type: "number" },
          avg_issue_response_hours: { type: "number" },
          trend_data: { type: "array", items: { type: "object", properties: { date: { type: "string" }, value: { type: "number" } } } },
        }
      },
      add_context_from_internet: true,
    });

    setProject(data);
    setTrendData(data.trend_data || []);
    addRecentlyViewed(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading project details…</p>
      </div>
    );
  }

  if (!project) return null;

  const qualityBadges = [
    project.typescript_support && { label: 'TypeScript', color: 'bg-accent/10 text-accent' },
    project.beginner_friendly && { label: 'Beginner Friendly', color: 'bg-primary/10 text-primary' },
    project.self_hostable && { label: 'Self-Hostable', color: 'bg-chart-3/20 text-chart-3' },
    project.privacy_focused && { label: 'Privacy Focused', color: 'bg-chart-4/20 text-chart-4' },
    project.actively_maintained && { label: 'Actively Maintained', color: 'bg-primary/10 text-primary' },
  ].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to results
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {qualityBadges.map((b, i) => (
                <Badge key={i} className={`${b.color} border-0 text-xs`}>{b.label}</Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {project.github_url && (
              <Button asChild variant="outline" size="sm">
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  GitHub
                </a>
              </Button>
            )}
            {project.website_url && (
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Website
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          <StatBadge icon={Star} label="Stars" value={(project.stars || 0).toLocaleString()} color="text-yellow-500" />
          <StatBadge icon={GitFork} label="Forks" value={(project.forks || 0).toLocaleString()} color="text-muted-foreground" />
          <StatBadge icon={Users} label="Contributors" value={(project.contributors || 0).toLocaleString()} color="text-accent" />
          <StatBadge icon={Download} label="Weekly DLs" value={(project.weekly_downloads || 0).toLocaleString()} color="text-primary" />
          <StatBadge icon={Clock} label="Avg Response" value={`${project.avg_issue_response_hours || '?'}h`} color="text-chart-4" />
          <StatBadge icon={Package} label="Bundle" value={project.bundle_size_kb ? `${project.bundle_size_kb}kb` : 'N/A'} color="text-chart-3" />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Description + Chart */}
          <div className="lg:col-span-2 space-y-6">
            {project.full_description && (
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  About
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.full_description}</p>
              </div>
            )}

            {/* Star trend chart */}
            {trendData.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Star Growth (12 months)
                </h3>
                <TrendChart data={trendData} />
              </div>
            )}

            <HealthScore project={project} />

            {/* Quality metrics */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-accent" />
                Quality Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Docs Quality', value: project.docs_quality, icon: BookOpen },
                  { label: 'Learning Curve', value: project.learning_curve, icon: Gauge },
                  { label: 'Deploy Difficulty', value: project.deployment_difficulty, icon: Shield },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-medium text-foreground capitalize">{m.value || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <CommunityInsights
              pros={project.pros || []}
              cons={project.cons || []}
              sentiment={project.community_sentiment}
            />
            <EcosystemGraph
              projectName={project.name}
              relatedProjects={project.related_projects || []}
            />
            <InstallCommand project={project} />

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Details</h3>
              {[
                { label: 'Language', value: project.language },
                { label: 'License', value: project.license },
                { label: 'NPM Package', value: project.npm_package },
              ].filter(m => m.value).map((m, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="text-foreground font-medium">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}