'use client';

import React from 'react';
import { PERSONAS } from '../../lib/shared/constants';
import { Persona } from '../../lib/shared/types';
import { Check, User, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';

interface PersonaSelectorProps {
  activePersonaId: string;
  onSelectPersona: (personaId: string) => void;
}

export function PersonaSelector({ activePersonaId, onSelectPersona }: PersonaSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PERSONAS.map((persona) => {
        const isSelected = persona.id === activePersonaId;

        return (
          <button
            key={persona.id}
            type="button"
            onClick={() => onSelectPersona(persona.id)}
            className={clsx(
              'p-4 rounded-lg border text-left transition-all relative flex flex-col justify-between space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isSelected
                ? 'bg-surface border-accent ring-1 ring-accent shadow-soft'
                : 'bg-surface border-border hover:border-accent/50'
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent text-surface flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-heading font-bold text-sm flex items-center justify-center border border-accent/20">
                {persona.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-heading font-bold text-ink text-sm">
                  {persona.name}
                </h4>
                <p className="text-xs text-muted truncate">{persona.title}</p>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              {persona.personality}
            </p>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
              <span>{persona.style}</span>
              <span className="font-medium text-ink">{persona.difficulty}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
