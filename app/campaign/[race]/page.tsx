'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { RACE_CONFIGS, RaceKey } from '../../../types';

export default function CampaignRacePage() {
  const router = useRouter();
  const params = useParams();
  const raceKey = params.race as RaceKey;
  
  const race = RACE_CONFIGS[raceKey];

  if (!race) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Race not found</div>
      </div>
    );
  }

  const handleLevelClick = (level: number) => {
    router.push(`/battle?race=${raceKey}&level=${level}`);
  };

  const handleBackToRaceSelector = () => {
    router.push('/campaign');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${race.colors.background} relative overflow-hidden`}>
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
          </div>
          
          <div className="w-32"></div>
        </div>
      </div>

      <div className="relative z-10 flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-5 gap-8">
            {Array.from({ length: 10 }, (_, index) => {
              const level = index + 1;
              const unlocked = level <= 3; // Mock: first 3 levels unlocked
              
              return (
                <div key={level} className="flex flex-col items-center">
                  <div
                    onClick={() => unlocked && handleLevelClick(level)}
                    className={`relative w-24 h-24 rounded-full border-4 cursor-pointer
                      flex items-center justify-center text-white font-bold text-lg
                      transition-all duration-300 transform hover:scale-110
                      ${unlocked ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                      backgroundColor: unlocked ? race.colors.primary : '#374151',
                      borderColor: unlocked ? race.colors.primary : '#6b7280',
                      boxShadow: unlocked ? `0 0 20px ${race.colors.glow}` : 'none'
                    }}
                  >
                    {unlocked ? level : '🔒'}
                  </div>
                  
                  <div className="mt-2 text-white text-sm font-medium text-center">
                    Level {level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
