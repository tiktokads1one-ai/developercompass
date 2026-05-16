import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';

function computeScore(project) {
  let score = 0;
  const breakdown = [];

  // Stars (0–25 pts)
  const stars = project.stars || 0;
  const starPts = Math.min(25, Math.round((Math.log10(Math.max(stars, 1)) / Math.log10(100000)) * 25));
  score += starPts;
  breakdown.push({ label: 'Stars', pts: starPts, max: 25 });

  // Active maintenance (0–20 pts)
  let maintPts = 0;
  if (project.actively_maintained) maintPts += 12;
  if (project.last_commit_date) {
    const daysSince = (Date.now() - new Date(project.last_commit_date)) / 86400000;
    if (daysSince < 14) maintPts += 8;
    else if (daysSince < 60) maintPts += 5;
    else if (daysSince < 180) maintPts += 2;
  } else if (project.actively_maintained) {
    maintPts += 5; // assume recent if no date but flagged active
  }
  score += maintPts;
  breakdown.push({ label: 'Maintenance', pts: maintPts, max: 20 });

  // Community (0–20 pts)
  let commPts = 0;
  const sentimentMap = { very_positive: 20, positive: 14, mixed: 7, negative: 2 };
  commPts = sentimentMap[project.community_sentiment] || 0;
  score += commPts;
  breakdown.push({ label: 'Community', pts: commPts, max: 20 });

  // Issue health (0–15 pts)
  let issuePts = 0;
  const responseHrs = project.avg_issue_response_hours;
  if (responseHrs) {
    if (responseHrs < 12) issuePts = 15;
    else if (responseHrs < 48) issuePts = 11;
    else if (responseHrs < 120) issuePts = 7;
    else issuePts = 3;
  } else {
    issuePts = 7; // neutral
  }
  score += issuePts;
  breakdown.push({ label: 'Issue Response', pts: issuePts, max: 15 });

  // Docs (0–10 pts)
  const docsMap = { excellent: 10, good: 7, average: 4, poor: 1 };
  const docsPts = docsMap[project.docs_quality] || 4;
  score += docsPts;
  breakdown.push({ label: 'Docs', pts: docsPts, max: 10 });

  // Contributors (0–10 pts)
  const contribs = project.contributors || 0;
  const contribPts = Math.min(10, Math.round((Math.log10(Math.max(contribs, 1)) / Math.log10(1000)) * 10));
  score += contribPts;
  breakdown.push({ label: 'Contributors', pts: contribPts, max: 10 });

  return { score: Math.min(100, score), breakdown };
}

function scoreColor(score) {
  if (score >= 80) return { text: 'text-primary', stroke: 'hsl(var(--primary))' };
  if (score >= 60) return { text: 'text-accent', stroke: 'hsl(var(--accent))' };
  if (score >= 40) return { text: 'text-chart-4', stroke: 'hsl(var(--chart-4))' };
  return { text: 'text-destructive', stroke: 'hsl(var(--destructive))' };
}

function scoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Healthy';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs attention';
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function HealthScore({ project }) {
  const { score, breakdown } = useMemo(() => computeScore(project), [project]);
  const { text, stroke } = scoreColor(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card/50">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Gauge className="w-4 h-4 text-primary" />
        Project Health Score
      </h3>

      <div className="flex items-center gap-6">
        {/* Circular gauge */}
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            {/* Track */}
            <circle
              cx="48" cy="48" r={RADIUS}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            {/* Progress */}
            <motion.circle
              cx="48" cy="48" r={RADIUS}
              fill="none"
              stroke={stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              transform="rotate(-90 48 48)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${text}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Label + breakdown */}
        <div className="flex-1 min-w-0">
          <p className={`text-base font-semibold mb-3 ${text}`}>{scoreLabel(score)}</p>
          <div className="space-y-1.5">
            {breakdown.map(({ label, pts, max }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
                <div className="flex-1 h-1 rounded-full bg-secondary/60">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: stroke }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(pts / max) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{pts}/{max}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}