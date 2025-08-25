'use client';

import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { RaceKey, RACE_CONFIGS } from '../../types';

const BattleEngine = dynamic(() => import('./BattleEngine'), { ssr: false });

function BattleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const race = searchParams.get('race') as RaceKey | null;
  const level = searchParams.get('level');
  
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

  const battleConfig = {
    race: race,
    level: parseInt(level),
    raceConfig: RACE_CONFIGS[race]
  };

  const handleBackToCampaign = () => {
    router.push(`/campaign/${race}`);
  };

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-600">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBackToCampaign}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg 
                       border border-gray-500 transition-colors duration-200 flex items-center gap-2"
          >
            ← Back to Campaign
          </button>
          
          <div className="text-center">
            <div className="flex items-center gap-4">
              <div className="text-2xl">
                {race === 'human' ? '🛡️' : race === 'sliver' ? '🧬' : '🔮'}
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  {RACE_CONFIGS[race].displayName} Campaign
                </div>
                <div className="text-gray-300 text-sm">
                  Mission {level}
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-32"></div>
        </div>
      </div>
      
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
