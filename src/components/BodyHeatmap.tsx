
import React from 'react';

const getHeatColor = (sets: number) => {
  if (sets === 0) return '#1e1e2e';
  if (sets <= 2) return 'rgba(232, 255, 11, 0.2)';
  if (sets <= 5) return 'rgba(232, 255, 11, 0.5)';
  return '#e8ff47';
};

const MuscleTooltip = ({ name, sets }: { name: string, sets: number }) => (
  <title>{`${name}: ${sets.toFixed(1)} séries`}</title>
);

export const BodyFront = ({ volumeData }: { volumeData: {name: string, sets: number}[] }) => {
  const getSets = (muscle: string) => volumeData.find(v => v.name === muscle)?.sets || 0;
  
  return (
    <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-2xl">
      {/* Detailed Body Shell - Buff Silhouette */}
      <path d="M100 20 C85 20 75 30 75 45 C75 60 85 70 100 70 C115 70 125 60 125 45 C125 30 115 20 100 20" fill="#12121e" fillOpacity="0.5" />
      
      {/* Traps Front */}
      <path d="M85 70 Q100 75 115 70 L110 85 L90 85 Z" fill={getHeatColor(getSets('Trapèzes'))}><MuscleTooltip name="Trapèzes" sets={getSets('Trapèzes')} /></path>

      {/* Pectorals */}
      <path d="M100 90 L135 85 Q145 90 140 120 Q120 135 100 130 Z" fill={getHeatColor(getSets('Pectoraux'))} className="cursor-help"><MuscleTooltip name="Pectoraux" sets={getSets('Pectoraux')} /></path>
      <path d="M100 90 L65 85 Q55 90 60 120 Q80 135 100 130 Z" fill={getHeatColor(getSets('Pectoraux'))} className="cursor-help"><MuscleTooltip name="Pectoraux" sets={getSets('Pectoraux')} /></path>

      {/* Deltoids - Ant/Lateral */}
      <path d="M135 85 Q155 85 155 115 Q150 140 135 130 Z" fill={getHeatColor(getSets('Épaules (Antérieur)') + getSets('Épaules (Latéral)'))}><MuscleTooltip name="Deltoïdes" sets={getSets('Épaules (Antérieur)') + getSets('Épaules (Latéral)')} /></path>
      <path d="M65 85 Q45 85 45 115 Q50 140 65 130 Z" fill={getHeatColor(getSets('Épaules (Antérieur)') + getSets('Épaules (Latéral)'))}><MuscleTooltip name="Deltoïdes" sets={getSets('Épaules (Antérieur)') + getSets('Épaules (Latéral)')} /></path>

      {/* Biceps */}
      <path d="M155 115 Q170 150 155 185 L140 185 Q145 145 140 120 Z" fill={getHeatColor(getSets('Biceps'))}><MuscleTooltip name="Biceps" sets={getSets('Biceps')} /></path>
      <path d="M45 115 Q30 150 45 185 L60 185 Q55 145 60 120 Z" fill={getHeatColor(getSets('Biceps'))}><MuscleTooltip name="Biceps" sets={getSets('Biceps')} /></path>

      {/* Forearms Front */}
      <path d="M155 185 L165 240 L150 240 L140 185 Z" fill={getHeatColor(getSets('Avant-bras'))} />
      <path d="M45 185 L35 240 L50 240 L60 185 Z" fill={getHeatColor(getSets('Avant-bras'))} />

      {/* Abdominals */}
      <g fill={getHeatColor(getSets('Abdominaux'))}>
        <rect x="85" y="140" width="14" height="8" rx="1.5" />
        <rect x="101" y="140" width="14" height="8" rx="1.5" />
        <rect x="85" y="150" width="14" height="8" rx="1.5" />
        <rect x="101" y="150" width="14" height="8" rx="1.5" />
        <rect x="85" y="160" width="14" height="8" rx="1.5" />
        <rect x="101" y="160" width="14" height="8" rx="1.5" />
        <rect x="85" y="170" width="14" height="8" rx="1.5" />
        <rect x="101" y="170" width="14" height="8" rx="1.5" />
      </g>

      {/* Obliques & Serratus */}
      <path d="M75 140 Q65 160 70 185 L80 185 Q75 160 80 140 Z" fill={getHeatColor(getSets('Abdominaux'))} fillOpacity="0.4" />
      <path d="M125 140 Q135 160 130 185 L120 185 Q125 160 120 140 Z" fill={getHeatColor(getSets('Abdominaux'))} fillOpacity="0.4" />

      {/* Quads */}
      <g fill={getHeatColor(getSets('Quadriceps'))}>
        <path d="M70 210 Q85 205 98 210 L94 320 Q80 330 70 320 Z" />
        <path d="M130 210 Q115 205 102 210 L106 320 Q120 330 130 320 Z" />
      </g>

      {/* Calves Front */}
      <path d="M75 330 L90 330 L85 410 L78 410 Z" fill={getHeatColor(getSets('Mollets'))} />
      <path d="M125 330 L110 330 L115 410 L122 410 Z" fill={getHeatColor(getSets('Mollets'))} />

      {/* Hands placeholder */}
      <circle cx="157" cy="245" r="8" fill="#12121e" />
      <circle cx="43" cy="245" r="8" fill="#12121e" />
    </svg>
  );
};

export const BodyBack = ({ volumeData }: { volumeData: {name: string, sets: number}[] }) => {
  const getSets = (muscle: string) => volumeData.find(v => v.name === muscle)?.sets || 0;

  return (
    <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-2xl">
      {/* Head Back */}
      <path d="M100 20 C85 20 75 30 75 45 C75 60 85 70 100 70 C115 70 125 60 125 45 C125 30 115 20 100 20" fill="#12121e" />

      {/* Traps Back */}
      <path d="M100 75 L140 90 L125 150 L100 120 L75 150 L60 90 Z" fill={getHeatColor(getSets('Trapèzes'))} />
      
      {/* Deltoids Posterior */}
      <path d="M140 90 Q155 90 155 120 Q150 140 135 130 Z" fill={getHeatColor(getSets('Épaules (Postérieur)'))} />
      <path d="M60 90 Q45 90 45 120 Q50 140 65 130 Z" fill={getHeatColor(getSets('Épaules (Postérieur)'))} />

      {/* Lats */}
      <path d="M125 150 Q145 180 135 220 L100 210 L65 220 Q55 180 75 150 Z" fill={getHeatColor(getSets('Lats'))} />
      
      {/* Triceps */}
      <path d="M155 120 Q165 150 155 185 L140 185 Q135 150 135 130 Z" fill={getHeatColor(getSets('Triceps'))} />
      <path d="M45 120 Q35 150 45 185 L60 185 Q65 150 65 130 Z" fill={getHeatColor(getSets('Triceps'))} />

      {/* Erector Spinae / Lower Back */}
      <path d="M92 210 L108 210 L108 240 L92 240 Z" fill={getHeatColor(getSets('Lombaires'))} />
      
      {/* Glutes */}
      <path d="M65 235 Q100 250 135 235 L135 285 Q100 300 65 285 Z" fill={getHeatColor(getSets('Fessiers'))} />
      
      {/* Hamstrings */}
      <g fill={getHeatColor(getSets('Ischios'))}>
        <path d="M70 290 Q85 300 98 290 L94 360 L70 360 Z" />
        <path d="M130 290 Q115 300 102 290 L106 360 L130 360 Z" />
      </g>
      
      {/* Calves Back */}
      <path d="M75 370 Q85 370 90 380 L88 420 L72 420 Z" fill={getHeatColor(getSets('Mollets'))} />
      <path d="M125 370 Q115 370 110 380 L112 420 L128 420 Z" fill={getHeatColor(getSets('Mollets'))} />
    </svg>
  );
};
