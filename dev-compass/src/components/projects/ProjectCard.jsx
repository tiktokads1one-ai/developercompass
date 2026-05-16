import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star, GitFork, ArrowUpRight, TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const trendIcons = {
  rising: <TrendingUp className="w-3 h-3 text-primary" />,
  stable: <Minus className="w-3 h-3 text-muted-foreground" />,
  declining: <TrendingDown className="w-3 h-3 text-destructive" />,
};

const sentimentColors = {
  very_positive: 'text-primary',
  positive: 'text-primary/70',
  mixed: 'text-yellow-400',
  negative: 'text-destructive',
};

export default function ProjectCard({ project, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/project/${encodeURIComponent(project.name)}`}
        className="group block p-5 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 hover:glow-green transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              {project.star_growth_trend && trendIcons[project.star_growth_trend]}
              {project.typescript_support && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-accent/10 text-accent border-0">
                  TS
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(project.tags || []).slice(0, 4).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-secondary/50 text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                {(project.stars || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" />
                {(project.forks || 0).toLocaleString()}
              </span>
              {project.bundle_size_kb && (
                <span>{project.bundle_size_kb}kb</span>
              )}
              {project.license && (
                <span>{project.license}</span>
              )}
              {project.community_sentiment && (
                <span className={`flex items-center gap-1 ${sentimentColors[project.community_sentiment]}`}>
                  <CheckCircle className="w-3 h-3" />
                  {project.community_sentiment.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}