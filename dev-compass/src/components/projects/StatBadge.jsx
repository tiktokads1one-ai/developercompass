import React from 'react';

export default function StatBadge({ icon: Icon, label, value, color = 'text-muted-foreground' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}