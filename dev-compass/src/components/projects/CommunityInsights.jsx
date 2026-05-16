import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

export default function CommunityInsights({ pros = [], cons = [], sentiment }) {
  const sentimentLabels = {
    very_positive: { label: 'Very Positive', color: 'text-primary', bg: 'bg-primary/10' },
    positive: { label: 'Positive', color: 'text-primary/70', bg: 'bg-primary/5' },
    mixed: { label: 'Mixed', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    negative: { label: 'Negative', color: 'text-destructive', bg: 'bg-destructive/10' },
  };

  const s = sentimentLabels[sentiment] || sentimentLabels.positive;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card/50">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Community Insights</h3>
        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color} ${s.bg}`}>
          {s.label}
        </span>
      </div>

      {pros.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ThumbsUp className="w-3 h-3 text-primary" />
            What people love
          </p>
          <ul className="space-y-1.5">
            {pros.map((p, i) => (
              <li key={i} className="text-sm text-foreground/80 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/40">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cons.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            Common complaints
          </p>
          <ul className="space-y-1.5">
            {cons.map((c, i) => (
              <li key={i} className="text-sm text-foreground/80 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-yellow-400/40">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}