import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Network } from 'lucide-react';

const NODE_RADIUS = 32;
const CENTER_RADIUS = 40;

function polarToCart(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function EcosystemGraph({ projectName, relatedProjects = [] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  if (!relatedProjects || relatedProjects.length === 0) return null;

  const W = 420;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const orbitR = 120;

  const nodes = relatedProjects.slice(0, 7).map((name, i) => {
    const angle = (360 / Math.min(relatedProjects.length, 7)) * i - 90;
    const pos = polarToCart(cx, cy, orbitR, angle);
    return { name, x: pos.x, y: pos.y };
  });

  const colors = ['#22c55e', '#38bdf8', '#a78bfa', '#fb923c', '#f472b6', '#34d399', '#fbbf24'];

  return (
    <div className="p-5 rounded-2xl border border-border bg-card/50">
      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <Network className="w-4 h-4 text-primary" />
        Ecosystem Map
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Click a node to explore</p>

      <div className="relative flex items-center justify-center overflow-hidden">
        <svg width={W} height={H} className="overflow-visible">
          {/* Orbit ring */}
          <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

          {/* Connection lines */}
          {nodes.map((node, i) => (
            <line
              key={`line-${i}`}
              x1={cx} y1={cy}
              x2={node.x} y2={node.y}
              stroke={colors[i % colors.length]}
              strokeWidth={hovered === node.name ? 2 : 1}
              opacity={hovered && hovered !== node.name ? 0.15 : 0.5}
              className="transition-all duration-200"
            />
          ))}

          {/* Center node */}
          <g>
            <circle cx={cx} cy={cy} r={CENTER_RADIUS} fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={CENTER_RADIUS - 8} fill="hsl(var(--primary)/0.08)" />
            <text
              x={cx} y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="hsl(var(--primary))"
              className="pointer-events-none"
            >
              {projectName.length > 10 ? projectName.slice(0, 10) + '…' : projectName}
            </text>
          </g>

          {/* Satellite nodes */}
          {nodes.map((node, i) => {
            const isHov = hovered === node.name;
            const color = colors[i % colors.length];
            return (
              <g
                key={node.name}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(node.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/project/${encodeURIComponent(node.name)}`)}
              >
                <circle
                  cx={node.x} cy={node.y}
                  r={NODE_RADIUS + (isHov ? 4 : 0)}
                  fill={`${color}18`}
                  stroke={color}
                  strokeWidth={isHov ? 2 : 1.5}
                  className="transition-all duration-150"
                />
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight={isHov ? '700' : '500'}
                  fill={isHov ? color : 'hsl(var(--foreground))'}
                  className="pointer-events-none transition-all duration-150"
                >
                  {node.name.length > 10 ? node.name.slice(0, 10) + '…' : node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {nodes.map((node, i) => (
          <button
            key={node.name}
            onClick={() => navigate(`/project/${encodeURIComponent(node.name)}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
            {node.name}
          </button>
        ))}
      </div>
    </div>
  );
}