'use client';

import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { RaceKey, RACE_CONFIGS } from '../../types';

// Importación dinámica del componente de batalla (lo crearemos después)
const BattleEngine = dynamic(() => import('./BattleEngine'), { ssr: false });

function BattleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const race = searchParams.get('race') as RaceKey | null;
  const level = searchParams.get('level');
  
  // Validación de parámetros
  if (!race || !RACE_CONFIGS[race] || !level) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Invalid battle parameters</div>
          <button
            onClick={() => router.push('/campaign')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Return to Campaign
          </button>
        </div>
      </div>
    );
  }

  const raceConfig = RACE_CONFIGS[race];
  const levelNumber = parseInt(level);

  // Configuración de batalla
  const battleConfig = {
    race: race,
    level: levelNumber,
    raceConfig: raceConfig,
    // Determinar enemigos (las otras dos razas)
    enemyRaces: (['human', 'sliver', 'alien'] as RaceKey[]).filter(r => r !== race)
  };

  // Función para volver a la campaña
  const handleBackToCampaign = () => {
    router.push(`/campaign/${race}`);
  };

  return (
    <div className="w-full h-screen relative">
      {/* Header de batalla */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-600">
        <div className="flex items-center justify-between px-6 py-4">
          
          {/* Botón de regreso */}
          <button
            onClick={handleBackToCampaign}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg 
                       border border-gray-500 transition-colors duration-200 flex items-center gap-2"
          >
            ← Back to Campaign
          </button>
          
          {/* Información del nivel */}
          <div className="text-center">
            <div className="flex items-center gap-4">
              <div 
                className="text-2xl"
                style={{ color: raceConfig.colors.primary }}
              >
                {race === 'human' ? '🛡️' : race === 'sliver' ? '🧬' : '🔮'}
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  {raceConfig.displayName} Campaign
                </div>
                <div className="text-gray-300 text-sm">
                  Mission {levelNumber} - {getMissionName(levelNumber)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Controles de juego (placeholder) */}
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-500">
              ⏸️
            </button>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-500">
              ⚡
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="w-full h-full pt-20">
        <BattleEngine config={battleConfig} />
      </div>
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading battle...</div>
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    }>
      <BattleContent />
    </Suspense>
  );
}

// Helper function para nombres de misión
function getMissionName(level: number): string {
  const names = [
    "First Contact",
    "Defensive Line", 
    "Heavy Assault",
    "Strategic Position",
    "Multi-Wave Attack",
    "Elite Forces",
    "Siege Warfare", 
    "Final Push",
    "Last Stand",
    "Total Victory"
  ];
  
  return names[level - 1] || `Mission ${level}`;
}