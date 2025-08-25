'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { RACE_CONFIGS, RaceKey } from '../../../types';

type LevelData = {
  id: number;
  name: string;
  stars: number; // 0-3 estrellas ganadas
  unlocked: boolean;
  completed: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  enemyPreview: string[]; // Razas enemigas que enfrentarás
};

type CampaignProgress = {
  [key in RaceKey]: {
    currentLevel: number;
    levelsCompleted: number;
    totalStars: number;
    levelData: LevelData[];
  }
};

// Mock data - luego vendrá de localStorage/backend
const generateCampaignData = (): CampaignProgress => {
  const createLevels = (playerRace: RaceKey): LevelData[] => {
    // Las otras dos razas serán los enemigos
    const enemyRaces = (['human', 'sliver', 'alien'] as RaceKey[])
      .filter(race => race !== playerRace);
    
    return Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Mission ${index + 1}`,
      stars: index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0, // Mock: primeros niveles completados
      unlocked: index <= 3, // Mock: primeros 4 niveles desbloqueados
      completed: index <= 2, // Mock: primeros 3 niveles completados
      difficulty: index < 3 ? 'easy' : index < 7 ? 'normal' : 'hard',
      enemyPreview: index % 2 === 0 ? [enemyRaces[0]] : enemyRaces
    }));
  };

  return {
    human: {
      currentLevel: 4,
      levelsCompleted: 3,
      totalStars: 6,
      levelData: createLevels('human')
    },
    sliver: {
      currentLevel: 1,
      levelsCompleted: 0,
      totalStars: 0,
      levelData: createLevels('sliver')
    },
    alien: {
      currentLevel: 1,
      levelsCompleted: 0,
      totalStars: 0,
      levelData: createLevels('alien')
    }
  };
};

export default function CampaignRacePage() {
  const router = useRouter();
  const params = useParams();
  const raceKey = params.race as RaceKey;
  
  const [campaignData, setCampaignData] = useState<CampaignProgress | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  useEffect(() => {
    // Simular carga de datos
    const data = generateCampaignData();
    setCampaignData(data);
  }, []);

  if (!campaignData || !RACE_CONFIGS[raceKey]) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading campaign...</div>
      </div>
    );
  }

  const race = RACE_CONFIGS[raceKey];
  const progress = campaignData[raceKey];

  const handleLevelClick = (level: LevelData) => {
    if (!level.unlocked) return;
    setSelectedLevel(level);
  };

  const handlePlayLevel = () => {
    if (!selectedLevel) return;
    router.push(`/battle?race=${raceKey}&level=${selectedLevel.id}`);
  };

  const handleBackToRaceSelector = () => {
    router.push('/campaign');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${race.colors.background} relative overflow-hidden`}>
      
      {/* Efectos de fondo dinámicos */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-16 right-16 w-40 h-40 rounded-full blur-3xl opacity-50 animate-pulse"
          style={{ backgroundColor: race.colors.primary }}
        ></div>
        <div 
          className="absolute bottom-32 left-32 w-56 h-56 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ backgroundColor: race.colors.accent, animationDelay: '1s' }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-2xl opacity-40 animate-pulse"
          style={{ backgroundColor: race.colors.secondary, animationDelay: '2s' }}
        ></div>
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(${race.colors.primary}40 1px, transparent 1px),
            linear-gradient(90deg, ${race.colors.primary}40 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      ></div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="flex items-center justify-between px-8 mb-6">
          <button
            onClick={handleBackToRaceSelector}
            className="px-6 py-3 bg-gray-700/80 hover:bg-gray-600/80 text-white rounded-lg 
                       border border-gray-500 transition-all duration-200 flex items-center gap-2
                       backdrop-blur-sm hover:scale-105"
          >
            ← Back to Races
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white tracking-wider mb-2">
              {race.displayName} Campaign
            </h1>
            <div 
              className="mx-auto w-40 h-1 rounded-full"
              style={{ backgroundColor: race.colors.primary }}
            ></div>
            <p className="text-gray-300 mt-3 text-lg">
              Master the art of {race.theme} warfare
            </p>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Progress Summary */}
        <div className="max-w-4xl mx-auto px-8">
          <div 
            className="bg-black/30 rounded-2xl p-6 border backdrop-blur-sm"
            style={{ borderColor: race.colors.primary + '40' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div 
                  className="text-3xl font-bold mb-1"
                  style={{ color: race.colors.primary }}
                >
                  {progress.currentLevel}/10
                </div>
                <div className="text-sm text-gray-300">Current Mission</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-bold mb-1"
                  style={{ color: race.colors.accent }}
                >
                  {progress.levelsCompleted}
                </div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {progress.totalStars}
                </div>
                <div className="text-sm text-gray-300">Total Stars</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {progress.levelData.filter(l => l.stars === 3).length}
                </div>
                <div className="text-sm text-gray-300">Perfect Scores</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Campaign Map - 2/3 del ancho */}
          <div className="lg:col-span-2">
            <div 
              className="bg-black/20 rounded-2xl p-8 border backdrop-blur-sm h-full"
              style={{ borderColor: race.colors.secondary + '60' }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Mission Map</h3>
              
              {/* Grid de niveles - 2 filas de 5 */}
              <div className="grid grid-cols-5 gap-6 justify-items-center">
                {progress.levelData.map((level, index) => (
                  <LevelNode
                    key={level.id}
                    level={level}
                    raceColors={race.colors}
                    isSelected={selectedLevel?.id === level.id}
                    onClick={() => handleLevelClick(level)}
                    connectsTo={index < 9 ? progress.levelData[index + 1] : null}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 flex justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: race.colors.primary }}
                  ></div>
                  <span className="text-gray-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                  <span className="text-gray-300">Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Details - 1/3 del ancho */}
          <div className="lg:col-span-1">
            <div 
              className="bg-black/20 rounded-2xl p-6 border backdrop-blur-sm h-full"
              style={{ borderColor: race.colors.secondary + '60' }}
            >
              {selectedLevel ? (
                <MissionDetails 
                  level={selectedLevel} 
                  race={race} 
                  onPlay={handlePlayLevel}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4" style={{ color: race.colors.primary }}>
                    🎯
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Mission</h3>
                  <p className="text-gray-400">
                    Click on a mission to view details and start your campaign.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada nodo de nivel
function LevelNode({ 
  level, 
  raceColors, 
  isSelected,
  onClick,
  connectsTo
}: {
  level: LevelData;
  raceColors: any;
  isSelected: boolean;
  onClick: () => void;
  connectsTo: LevelData | null;
}) {
  const getNodeColor = () => {
    if (!level.unlocked) return '#6b7280';
    if (level.completed) return '#22c55e';
    return raceColors.primary;
  };

  const getNodeGlow = () => {
    if (!level.unlocked) return 'none';
    if (level.completed) return '0 0 20px #22c55e60';
    return `0 0 20px ${raceColors.glow}`;
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Connection line to next level */}
      {connectsTo && (level.id % 5 !== 0) && (
        <div 
          className="absolute top-12 left-12 w-6 h-0.5 z-0"
          style={{ 
            backgroundColor: level.completed ? '#22c55e' : '#374151'
          }}
        ></div>
      )}
      
      {/* Vertical connection for rows */}
      {level.id <= 5 && (
        <div 
          className="absolute top-24 left-11 w-0.5 h-6 z-0"
          style={{ 
            backgroundColor: level.completed ? '#22c55e' : '#374151'
          }}
        ></div>
      )}

      {/* Level Node */}
      <div
        onClick={onClick}
        className={`
          relative w-24 h-24 rounded-full border-4 cursor-pointer z-10
          flex items-center justify-center text-white font-bold text-lg
          transition-all duration-300 transform hover:scale-110
          ${level.unlocked 
            ? 'hover:shadow-lg' 
            : 'opacity-50 cursor-not-allowed'
          }
          ${isSelected ? 'scale-110 ring-4 ring-white ring-opacity-50' : ''}
        `}
        style={{
          backgroundColor: getNodeColor(),
          borderColor: getNodeColor(),
          boxShadow: getNodeGlow()
        }}
      >
        {!level.unlocked ? (
          <div className="text-2xl">🔒</div>
        ) : level.completed ? (
          <div className="text-2xl">✓</div>
        ) : (
          level.id
        )}
        
        {/* Difficulty indicator */}
        <div 
          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold
            ${level.difficulty === 'easy' ? 'bg-green-500' : 
              level.difficulty === 'normal' ? 'bg-yellow-500' : 'bg-red-500'}`}
        >
          {level.difficulty === 'easy' ? 'E' : level.difficulty === 'normal' ? 'N' : 'H'}
        </div>
      </div>
      
      {/* Level name */}
      <div className="mt-2 text-white text-sm font-medium text-center">
        {level.name}
      </div>
      
      {/* Stars */}
      <div className="flex gap-1 mt-1">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className={`text-xs ${
              index < level.stars ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            ⭐
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de detalles de misión
function MissionDetails({ level, race, onPlay }: {
  level: LevelData;
  race: any;
  onPlay: () => void;
}) {
  const getEnemyRaceIcon = (enemyRace: string) => {
    const icons = { human: '🛡️', sliver: '🧬', alien: '🔮' };
    return icons[enemyRace as keyof typeof icons] || '❓';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mission Header */}
      <div className="text-center mb-6">
        <h3 
          className="text-2xl font-bold mb-2"
          style={{ color: race.colors.primary }}
        >
          {level.name}
        </h3>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium
          ${level.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 
            level.difficulty === 'normal' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 
            'bg-red-500/20 text-red-400 border border-red-500/40'}`}
        >
          {level.difficulty.toUpperCase()}
        </div>
      </div>

      {/* Mission Stats */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="text-sm text-gray-400 mb-1">Status</div>
          <div className={`font-medium ${level.completed ? 'text-green-400' : 'text-yellow-400'}`}>
            {level.completed ? 'Completed' : 'Available'}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Stars Earned</div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }, (_, index) => (
              <span
                key={index}
                className={`text-lg ${
                  index < level.stars ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-2">Enemy Forces</div>
          <div className="flex gap-2">
            {level.enemyPreview.map((enemyRace, index) => (
              <div 
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-black/40 rounded border"
                style={{ borderColor: race.colors.secondary + '40' }}
              >
                <span className="text-lg">{getEnemyRaceIcon(enemyRace)}</span>
                <span className="text-xs text-gray-300 capitalize">{enemyRace}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Description */}
      <div className="flex-1 mb-6">
        <div className="text-sm text-gray-400 mb-2">Mission Briefing</div>
        <div className="text-sm text-gray-300 leading-relaxed">
          {getMissionDescription(level, race.key)}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={onPlay}
        disabled={!level.unlocked}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 
          ${level.unlocked 
            ? 'hover:scale-105 focus:outline-none focus:ring-2' 
            : 'opacity-50 cursor-not-allowed'}`}
        style={{
          background: level.unlocked 
            ? `linear-gradient(135deg, ${race.colors.primary}, ${race.colors.secondary})` 
            : '#374151',
          color: 'white',
          boxShadow: level.unlocked ? `0 4px 16px ${race.colors.glow}` : 'none'
        }}
      >
        {level.unlocked ? 'DEPLOY' : 'LOCKED'}
      </button>
    </div>
  );
}

// Helper function para generar descripciones de misión
function getMissionDescription(level: LevelData, playerRace: RaceKey): string {
  const descriptions = {
    human: [
      "Establish a defensive perimeter using marine bunkers and automated turrets.",
      "Heavy enemy assault incoming. Deploy missile turrets for maximum firepower.",
      "Multi-wave attack detected. Upgrade your defenses and prepare for siege.",
      "Elite enemy forces approaching. All defensive systems online.",
      "Strategic positioning required. Use terrain to your advantage.",
      "Massive enemy convoy detected. Concentrated firepower needed.",
      "Final assault preparations. Deploy all available defensive assets.",
      "Enemy command structure identified. Eliminate all hostile forces.",
      "Last stand protocol. Defend the base at all costs.",
      "Victory is within reach. Complete total enemy elimination."
    ],
    sliver: [
      "Spread the creep and establish spine crawler colonies.",
      "Enemy forces detected. Grow spore colonies for area denial.",
      "Biological warfare protocols active. Poison the battlefield.",
      "Swarm tactics engaged. Overwhelm with living defenses.",
      "Evolution chamber online. Upgrade your living weapons.",
      "Hive mind coordination required. Synchronize all defenses.",
      "Toxic environment protocols. Contaminate enemy approach routes.",
      "Final evolution phase. Unleash maximum biological warfare.",
      "The swarm protects. Hold the line with living walls.",
      "Ultimate organism achieved. Dominate the battlefield."
    ],
    alien: [
      "Channel psionic energy through photon cannon networks.",
      "Enemy minds detected. Deploy psionic amplifiers for control.",
      "Ancient technologies activated. Harness the power of the Void.",
      "Psi-storm protocols engaged. Cleanse the battlefield with energy.",
      "Shield generators online. Create impenetrable energy barriers.",
      "Tesla coil networks charged. Chain lightning across enemies.",
      "Void prison technology deployed. Contain and eliminate threats.",
      "Final psionic surge. Channel all energy into defense.",
      "The Khala protects. Stand united against the darkness.",
      "Transcendence achieved. Become one with pure energy."
    ]
  };
  
  return descriptions[playerRace][level.id - 1] || "Defend your position against incoming enemy forces.";
}