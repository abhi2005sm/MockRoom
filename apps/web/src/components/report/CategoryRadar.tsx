'use client';

import React from 'react';
import { CategoryScore } from '../../lib/shared/types';

interface CategoryRadarProps {
  categories: CategoryScore[];
}

export function CategoryRadar({ categories }: CategoryRadarProps) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const total = categories.length;

  // Calculate polygon points for category scores (0-100 normalized to radius)
  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = categories
    .map((cat, i) => {
      const { x, y } = getCoordinates(i, cat.score);
      return `${x},${y}`;
    })
    .join(' ');

  // Grid concentric rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-4 shadow-soft flex flex-col items-center">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading">
          Category Competency Radar
        </span>
        <div className="flex items-center gap-3 text-xs font-heading font-medium">
          <span className="flex items-center gap-1 text-accent">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            Your Performance
          </span>
        </div>
      </div>

      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Concentric Hexagons */}
        {rings.map((ring, rIdx) => {
          const ringPoints = categories
            .map((_, i) => {
              const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
              const r = radius * ring;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');

          return (
            <polygon
              key={rIdx}
              points={ringPoints}
              fill="none"
              stroke="#E4E3DD"
              strokeWidth="1"
              strokeDasharray={rIdx < 4 ? '2,2' : 'none'}
            />
          );
        })}

        {/* Axis Lines from Center */}
        {categories.map((_, i) => {
          const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#E4E3DD"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Radar Score Polygon: --accent fill and stroke */}
        <polygon
          points={polygonPoints}
          fill="rgba(47, 109, 93, 0.25)"
          stroke="#2F6D5D"
          strokeWidth="2.5"
        />

        {/* Data Point Nodes and Category Labels */}
        {categories.map((cat, i) => {
          const { x, y } = getCoordinates(i, cat.score);
          const labelAngle = (Math.PI * 2 / total) * i - Math.PI / 2;
          const labelRadius = radius + 24;
          const lx = center + labelRadius * Math.cos(labelAngle);
          const ly = center + labelRadius * Math.sin(labelAngle);

          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#C77E2C" stroke="#FFFFFF" strokeWidth="1.5" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-ink text-[10px] font-heading font-semibold"
              >
                {cat.label.split(' ')[0]} ({cat.score})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
