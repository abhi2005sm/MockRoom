'use client';

import React from 'react';
import { AlertTriangle, Camera, Mic, WifiOff, Smartphone, X } from 'lucide-react';

interface WarningBannerProps {
  type: 'face' | 'mic' | 'network' | 'phone';
  message: string;
  onDismiss?: () => void;
}

export function WarningBanner({ type, message, onDismiss }: WarningBannerProps) {
  const getIcon = () => {
    switch (type) {
      case 'face': return Camera;
      case 'mic': return Mic;
      case 'network': return WifiOff;
      case 'phone': return Smartphone;
      default: return AlertTriangle;
    }
  };

  const Icon = getIcon();

  return (
    <div className="bg-accent-warm-light border border-accent-warm/40 text-accent-warm rounded-md p-3 px-4 flex items-center justify-between shadow-sm animate-fade-in">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium font-body leading-tight">
          {message}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-accent-warm hover:text-ink p-1 rounded-sm focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
