'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface AttemptPoint {
  attemptNum: number;
  score: number;
  date: string;
}

const SAMPLE_ATTEMPTS: AttemptPoint[] = [
  { attemptNum: 1, score: 64, date: '18 Sep' },
  { attemptNum: 2, score: 72, date: '20 Sep' },
  { attemptNum: 3, score: 81, date: '21 Sep' },
  { attemptNum: 4, score: 88, date: '22 Sep' },
];

export function SelfIntroTrend() {
  const size = 320;
  const height = 160;
  const maxScore = 100;
  const minScore = 50;

  const points = SAMPLE_ATTEMPTS.map((a, i) => {
    const x = 40 + i * (size - 80) / (SAMPLE_ATTEMPTS.length - 1);
    const y = height - 30 - ((a.score - minScore) / (maxScore - minScore)) * (height - 60);
    return { x, y, score: a.score, label: `Attempt ${a.attemptNum}` };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-heading flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-accent" />
          Attempt-over-Attempt Progress
        </span>
        <span className="text-xs font-bold text-accent font-heading px-2 py-0.5 rounded bg-accent-light">
          +24 pts total gain
        </span>
      </div>

      {/* SVG Line Chart */}
      <div className="flex flex-col items-center">
        <svg width="100%" height={height} viewBox={`0 0 ${size} ${height}`} className="overflow-visible">
          {/* Horizontal Gridlines */}
          {[60, 80, 100].map((val) => {
            const y = height - 30 - ((val - minScore) / (maxScore - minScore)) * (height - 60);
            return (
              <g key={val}>
                <line x1="30" y1={y} x2={size - 20} y2={y} stroke="#E4E3DD" strokeWidth="1" strokeDasharray="3,3" />
                <text x="20" y={y + 3} textAnchor="end" className="fill-muted text-[10px] font-heading font-medium">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <polygon
            points={`40,${height - 30} ${polylineStr} ${size - 40},${height - 30}`}
            fill="rgba(47, 109, 93, 0.15)"
          />

          {/* Score Line */}
          <polyline
            points={polylineStr}
            fill="none"
            stroke="#2F6D5D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="5" fill="#C77E2C" stroke="#FFFFFF" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-ink text-xs font-heading font-bold">
                {p.score}
              </text>
              <text x={p.x} y={height - 10} textAnchor="middle" className="fill-muted text-[10px] font-heading">
                #{idx + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
