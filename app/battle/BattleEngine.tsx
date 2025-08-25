'use client';

import React, { useState, useEffect } from 'react';

type BattleConfig = {
  race: string;
  level: number;
  raceConfig: any;
};

export default function BattleEngine({ config }: { config: BattleConfig }) {
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'playing'>('loading');

  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState('ready');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const race = config.raceConfig;

  if (gameState === 'loading') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${race.colors.background} flex items-center justify-center`}>
        <div className="text-center">
          <div 
            className="text-6xl mb-6 animate-pulse"
            style={{ color: race.colors.primary }}
          >
            {config.race === 'human' ? '🛡️' : config.race === 'sliver' ? '🧬' : '🔮'}
          </div>
          <div className="text-white text-2xl font-bold mb-4">
            Initializing {race.displayName} Defenses...
          </div>
          <div className="text-gray-300 mb-6">
            Mission {config.level}: Prepare for battle
          </div>
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: race.colors.primary, borderTopColor: 'transparent' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${race.colors.background} relative`}>
      
      {gameState === 'ready' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center max-w-2xl px-8">
            <div 
              className="text-6xl mb-6"
              style={{ color: race.colors.primary }}
            >
              {config.race === 'human' ? '🛡️' : config.race === 'sliver' ? '🧬' : '🔮'}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Mission {config.level}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Deploy your {race.displayName} forces and defend your base against incoming enemy waves.
            </p>
            
            <button
              onClick={() => setGameState('playing')}
              className="px-12 py-4 font-bold text-xl rounded-lg border-2 
                         shadow-lg transform hover:scale-105 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${race.colors.primary}, ${race.colors.secondary})`,
                borderColor: race.colors.accent,
                boxShadow: `0 8px 32px ${race.colors.glow}`,
                color: 'white'
              }}
            >
              BEGIN MISSION
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4" style={{ color: race.colors.primary }}>
              🎮
            </div>
            <div className="text-white text-3xl font-bold mb-2">
              Game Engine Active
            </div>
            <div className="text-gray-400">
              {race.displayName} Campaign - Mission {config.level}
            </div>
            <div className="mt-8">
              <div className="text-gray-300">
                Tower defense gameplay will be implemented here
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
