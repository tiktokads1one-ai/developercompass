import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EcosystemMap({ projectName, relatedProjects = [], allProjects = [] }) {
  if (!relatedProjects || relatedProjects.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card/50">
      <h3 className="text-sm font-semibold text-foreground mb-1">People use this with…</h3>
      <p className="text-xs text-muted-foreground mb-4">Commonly paired with {projectName}</p>

      <div className="space-y-2">
        {relatedProjects.map((name, i) => {
          const linkedProject = allProjects.find(p => p.name === name);
          const content = (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-primary/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{name}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          );

          return linkedProject ? (
            <Link key={name} to={`/project/${linkedProject.id}`}>{content}</Link>
          ) : (
            <div key={name}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}