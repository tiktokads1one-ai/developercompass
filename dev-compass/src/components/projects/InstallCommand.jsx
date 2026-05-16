import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function detectInstallCmd(project) {
  if (project.npm_package) return `npm install ${project.npm_package}`;
  const name = project.name?.toLowerCase().replace(/\s+/g, '-');
  const lang = project.language?.toLowerCase();
  if (lang === 'python') return `pip install ${name}`;
  if (lang === 'go') return `go get github.com/.../${name}`;
  if (lang === 'rust') return `cargo add ${name}`;
  if (lang === 'java' || lang === 'kotlin') return null;
  // Default: try npm with project name
  return `npm install ${name}`;
}

export default function InstallCommand({ project }) {
  const [copied, setCopied] = useState(false);
  const cmd = detectInstallCmd(project);
  if (!cmd) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border font-mono group">
      <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
      <code className="flex-1 text-xs text-foreground/80 truncate">{cmd}</code>
      <button
        onClick={copy}
        className="shrink-0 p-1 rounded-lg hover:bg-secondary transition-colors"
        title="Copy install command"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <Check className="w-3.5 h-3.5 text-primary" />
            </motion.div>
          ) : (
            <motion.div key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
              <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}