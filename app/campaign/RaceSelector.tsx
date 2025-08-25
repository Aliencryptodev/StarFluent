'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RACE_CONFIGS, RaceKey } from '../../types';

export default function RaceSelector() {
  const [selectedRace, setSelectedRace] = useState<RaceKey>('human');
  const [hoveredRace, setHoveredRace] = useState<RaceKey | null>(null);
  const router = useRouter();

  const handlePlayCampaign = () => {
    router.push(`/campaign/${selectedRace}`);
  };

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Efectos de fondo dinámicos según raza seleccionada */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl opacity-50 transition-all duration-500"
          style={{ backgroundColor: RACE_CONFIGS[selectedRace].colors.primary }}
        ></div>
        <div 
          className="absolute bottom-20 left-20 w-56 h-56 rounded-full blur-3xl opacity-30 transition-all duration-500"
          style={{ backgroundColor: RACE_CONFIGS[selectedRace].colors.accent }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full blur-2xl opacity-40 transition-all duration-500"
          style={{ backgroundColor: RACE_CONFIGS[selectedRace].colors.secondary }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-6">
        <div className="flex items-center justify-between px-8 mb-4">
          <button
            onClick={handleBackHome}
            className="px-6 py-3 bg-gray-700/80 hover:bg-gray-600/80 text-white rounded-lg 
                       border border-gray-500 transition-all duration-200 flex items-center gap-2
                       backdrop-blur-sm hover:scale-105"
          >
            ← Back to Menu
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white tracking-wider">
              SELECT YOUR RACE
            </h1>
            <div 
              className="mt-2 mx-auto w-32 h-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: RACE_CONFIGS[selectedRace].colors.primary }}
            ></div>
          </div>
          
          <div className="w-32"></div> {/* Spacer */}
        </div>
      </div>

      {/* Selector de razas */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-8">
        
        {/* Raza superior: Human */}
        <div className="mb-20">
          <RaceCard
            raceKey="human"
            isSelected={selectedRace === 'human'}
            isHovered={hoveredRace === 'human'}
            onClick={() => setSelectedRace('human')}
            onMouseEnter={() => setHoveredRace('human')}
            onMouseLeave={() => setHoveredRace(null)}
          />
        </div>

        {/* Razas inferiores: Sliver y Alien */}
        <div className="flex justify-center items-center gap-32">
          <RaceCard
            raceKey="sliver"
            isSelected={selectedRace === 'sliver'}
            isHovered={hoveredRace === 'sliver'}
            onClick={() => setSelectedRace('sliver')}
            onMouseEnter={() => setHoveredRace('sliver')}
            onMouseLeave={() => setHoveredRace(null)}
          />
          
          <RaceCard
            raceKey="alien"
            isSelected={selectedRace === 'alien'}
            isHovered={hoveredRace === 'alien'}
            onClick={() => setSelectedRace('alien')}
            onMouseEnter={() => setHoveredRace('alien')}
            onMouseLeave={() => setHoveredRace(null)}
          />
        </div>
      </div>

      {/* Descripción de la raza seleccionada */}
      <div className="relative z-10 mt-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center transition-all duration-500 bg-black/30 rounded-2xl p-8 border backdrop-blur-sm"
            style={{ borderColor: RACE_CONFIGS[selectedRace].colors.primary + '40' }}
          >
            <h2 
              className="text-3xl font-bold mb-6 transition-colors duration-300"
              style={{ color: RACE_CONFIGS[selectedRace].colors.primary }}
            >
              {RACE_CONFIGS[selectedRace].displayName} Campaign
            </h2>
            
            <p className="text-gray-300 text-xl leading-relaxed mb-6">
              {RACE_CONFIGS[selectedRace].description}
            </p>

            {/* Stats preview por raza */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              {getPreviewStats(selectedRace).map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-black/40 rounded-lg p-4 border"
                  style={{ borderColor: RACE_CONFIGS[selectedRace].colors.secondary + '60' }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div 
                    className="font-semibold text-lg"
                    style={{ color: RACE_CONFIGS[selectedRace].colors.accent }}
                  >
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="relative z-10 flex justify-center gap-8 mt-12 pb-16">
        <button
          onClick={handlePlayCampaign}
          className="px-10 py-4 font-bold text-xl rounded-lg border-2 
                     shadow-lg transform hover:scale-105 transition-all duration-300
                     focus:outline-none focus:ring-2"
          style={{
            background: `linear-gradient(135deg, ${RACE_CONFIGS[selectedRace].colors.primary}, ${RACE_CONFIGS[selectedRace].colors.secondary})`,
            borderColor: RACE_CONFIGS[selectedRace].colors.accent,
            boxShadow: `0 8px 32px ${RACE_CONFIGS[selectedRace].colors.glow}`,
            color: 'white'
          }}
        >
          PLAY {RACE_CONFIGS[selectedRace].displayName.toUpperCase()} CAMPAIGN
        </button>
        
        <button
          onClick={handleBackHome}
          className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 
                     text-white font-semibold text-xl rounded-lg border-2 border-gray-400
                     shadow-lg shadow-gray-500/25 hover:shadow-gray-400/50 
                     transform hover:scale-105 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

// Componente individual para cada tarjeta de raza
function RaceCard({ 
  raceKey,
  isSelected, 
  isHovered, 
  onClick, 
  onMouseEnter, 
  onMouseLeave 
}: {
  raceKey: RaceKey;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const race = RACE_CONFIGS[raceKey];

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative w-56 h-56 cursor-pointer transition-all duration-300 transform
        ${isSelected ? 'scale-110' : 'scale-100'}
        ${isHovered ? 'scale-105' : ''}
      `}
    >
      {/* Marco exterior con glow */}
      <div 
        className={`
          absolute inset-0 rounded-xl transition-all duration-300 blur-sm
          ${isSelected ? 'opacity-70' : 'opacity-40'}
        `}
        style={{
          backgroundColor: race.colors.primary,
          boxShadow: isSelected 
            ? `0 0 60px ${race.colors.primary}80, 0 0 100px ${race.colors.primary}40`
            : `0 0 30px ${race.colors.primary}40`
        }}
      ></div>

      {/* Marco principal */}
      <div 
        className={`
          relative w-full h-full rounded-xl border-2 
          bg-gradient-to-br from-gray-800 to-gray-900
          flex flex-col items-center justify-center
          transition-all duration-300 backdrop-blur-sm
        `}
        style={{
          borderColor: isSelected ? race.colors.primary : race.colors.secondary,
          backgroundImage: `linear-gradient(135deg, ${race.colors.glow}, transparent 60%)`
        }}
      >
        {/* Ícono temático de la raza */}
        <div 
          className={`
            w-20 h-20 rounded-full mb-6 flex items-center justify-center
            text-4xl font-bold transition-all duration-300 border-2
          `}
          style={{
            backgroundColor: race.colors.primary + '30',
            color: race.colors.primary,
            borderColor: race.colors.primary + '80'
          }}
        >
          {getRaceIcon(raceKey)}
        </div>

        {/* Nombre de la raza */}
        <h3 
          className="text-2xl font-bold tracking-wider transition-colors duration-300 mb-2"
          style={{ color: isSelected ? race.colors.primary : '#ffffff' }}
        >
          {race.displayName.toUpperCase()}
        </h3>

        {/* Subtítulo del tema */}
        <div 
          className="text-sm font-medium tracking-wide opacity-80"
          style={{ color: race.colors.accent }}
        >
          {race.theme.toUpperCase()}
        </div>

        {/* Indicador de selección */}
        {isSelected && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: race.colors.primary }}
            ></div>
          </div>
        )}
      </div>

      {/* Efectos de esquinas futuristas */}
      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 rounded-tl-lg"
           style={{ borderColor: race.colors.primary }}></div>
      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 rounded-tr-lg"
           style={{ borderColor: race.colors.primary }}></div>
      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 rounded-bl-lg"
           style={{ borderColor: race.colors.primary }}></div>
      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 rounded-br-lg"
           style={{ borderColor: race.colors.primary }}></div>
    </div>
  );
}

// Helper functions
function getRaceIcon(race: RaceKey): string {
  const icons = {
    human: '🛡️',
    sliver: '🧬', 
    alien: '🔮'
  };
  return icons[race];
}

function getPreviewStats(race: RaceKey) {
  const stats = {
    human: [
      { icon: '🔫', label: 'High Damage', description: 'Superior firepower and range' },
      { icon: '💥', label: 'Splash Damage', description: 'Area of effect weapons' },
      { icon: '⚙️', label: 'Technology', description: 'Advanced upgrades' }
    ],
    sliver: [
      { icon: '🧪', label: 'Poison DoT', description: 'Damage over time effects' },
      { icon: '🐛', label: 'Evolution', description: 'Adaptive abilities' },
      { icon: '🌿', label: 'Organic', description: 'Self-regenerating defenses' }
    ],
    alien: [
      { icon: '⚡', label: 'Energy Chains', description: 'Lightning between enemies' },
      { icon: '🌀', label: 'Psionic Control', description: 'Slow and confuse effects' },
      { icon: '✨', label: 'Pure Energy', description: 'Armor-piercing attacks' }
    ]
  };
  
  return stats[race];
}