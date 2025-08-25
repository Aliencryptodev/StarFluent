if (selectedTowerType) {
      // Verificar si podemos construir aquí
      if (canBuildAt(gridPos) && resources >= selectedTowerType.cost) {
        // Construir torre
        const entityId = addEntity({
          gridPos,
          type: 'tower',
          sprite: selectedTowerType.spriteKey,
          zIndex: 1
        });
        
        // Agregar torre al sistema de combate
        if (combatSystemRef.current) {
          combatSystemRef.current.addTower(entityId, selectedTowerType, gridPos);
        }
        
        setResources(prev => prev - selectedTowerType.cost);
        setSelectedTowerType(null);
        
       console.log(`Built ${selectedTowerType.name} at (${gridPos.row}, ${gridPos.col})`);
      }
    }
  }, [gameState, selectedTowerType, resources, addEntity]);

  return (
    <div className={`w-full h-full bg-gradient-to-br ${race.colors.background} relative`}>
      
      {/* Overlay de preparación */}
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
              Deploy your {race.displayName} forces to defend against incoming{' '}
              {config.enemyRaces.map((r, i, arr) => (
                <span key={r}>
                  <span style={{ color: RACE_CONFIGS[r].colors.primary }}>
                    {RACE_CONFIGS[r].displayName}
                  </span>
                  {i < arr.length - 1 ? (i === arr.length - 2 ? ' and ' : ', ') : ''}
                </span>
              ))}{' '}
              forces. Use your strategic advantage and deploy towers wisely.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2" style={{ color: race.colors.primary }}>💰</div>
                <div className="text-white font-bold text-xl">{resources}</div>
                <div className="text-gray-400 text-sm">Resources</div>
              </div>
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2 text-red-400">❤️</div>
                <div className="text-white font-bold text-xl">{lives}</div>
                <div className="text-gray-400 text-sm">Lives</div>
              </div>
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2 text-yellow-400">⚡</div>
                <div className="text-white font-bold text-xl">{availableTowers.length}</div>
                <div className="text-gray-400 text-sm">Tower Types</div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-12 py-4 font-bold text-xl rounded-lg border-2 
                         shadow-lg transform hover:scale-105 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${race.colors.primary}, ${race.colors.secondary})`,
                borderColor: race.colors.accent,
                boxShadow: `0 8px 32px ${race.colors.glow}`,
                color: 'white'
              // Actualizar sistema de combate
        if (combatSystemRef.current) {
          combatSystemRef.current.update(deltaTime);
          
          // Sincronizar proyectiles con entidades del motor gráfico
          syncProjectilesWithEntities();
          
          // Actualizar stats de combate
          setCombatStats(combatSystemRef.current.getTowerStats());
        }}
            >
              BEGIN MISSION
            </button>
          </div>
        </div>
      )}

      {/* Game Area - Motor Isométrico */}
      <div className="absolute inset-0 flex">
        
        {/* Main Game Area con Motor Isométrico */}
        <div className="flex-1 relative">
          <IsometricEngine
            race={config.race}
            level={config.level}
            onTileClick={handleTileClick}
            onEntityClick={handleEntityClick}
          >
            {/* Game Stats Overlay */}
            {gameState === 'playing' && (
              <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
                <div className="flex gap-4">
                  <div 
                    className="bg-black/80 rounded-lg px-4 py-2 border backdrop-blur-sm"
                    style={{ borderColor: race.colors.secondary + '60' }}
                  >
                    <div className="text-yellow-400 font-bold text-lg">{resources}</div>
                    <div className="text-gray-300 text-sm">Resources</div>
                  </div>
                  <div className="bg-black/80 rounded-lg px-4 py-2 border border-red-600/60 backdrop-blur-sm">
                    <div className="text-red-400 font-bold text-lg">{lives}</div>
                    <div className="text-gray-300 text-sm">Lives</div>
                  </div>
                  <div className="bg-black/80 rounded-lg px-4 py-2 border border-blue-600/60 backdrop-blur-sm">
                    <div className="text-blue-400 font-bold text-lg">{wave}</div>
                    <div className="text-gray-300 text-sm">Wave</div>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="bg-black/80 rounded-lg px-4 py-2 border border-green-600/60 backdrop-blur-sm">
                  <div className="text-green-400 font-bold text-sm">
                    {selectedTowerType ? `Building: ${selectedTowerType.name}` : 
                     selectedEntity ? `Selected: ${selectedEntity.type}` : 'Ready'}
                  </div>
                </div>
              </div>
            )}
          </IsometricEngine>
        </div>

        {/* Tower Selection Panel */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div 
            className="w-80 bg-black/80 border-l backdrop-blur-sm"
            style={{ borderColor: race.colors.secondary + '60' }}
          >
            <div className="p-4 h-full overflow-y-auto">
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: race.colors.primary }}
              >
                {race.displayName} Arsenal
              </h3>
              
              <div className="space-y-3 mb-6">
                {availableTowers.map((tower) => (
                  <div
                    key={tower.id}
                    onClick={() => handleTowerSelect(tower)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 
                      hover:scale-105 ${selectedTowerType?.id === tower.id ? 'ring-2 ring-white ring-opacity-50' : ''}
                      ${resources >= tower.cost ? 'opacity-100' : 'opacity-50'}`}
                    style={{
                      backgroundColor: selectedTowerType?.id === tower.id ? race.colors.glow : 'rgba(0,0,0,0.4)',
                      borderColor: resources >= tower.cost ? race.colors.secondary + '60' : '#666'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{tower.name}</div>
                      <div 
                        className={`font-bold ${resources >= tower.cost ? 'text-yellow-400' : 'text-red-400'}`}
                      >
                        ${tower.cost}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      Damage: {tower.damage} | Range: {tower.range}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {tower.attackType.toUpperCase()} • {tower.attackSpeed} APS
                    </div>
                    {tower.specialAbilities && tower.specialAbilities.length > 0 && (
                      <div className="text-xs" style={{ color: race.colors.accent }}>
                        {tower.specialAbilities.map(ability => ability.type.toUpperCase()).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Selected Tower Details */}
              {selectedTowerType && (
                <div 
                  className="mb-6 p-4 rounded-lg border"
                  style={{ 
                    borderColor: race.colors.primary + '60',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                  }}
                >
                  <h4 className="font-bold text-white mb-2">{selectedTowerType.name}</h4>
                  <div className="text-sm text-gray-300 mb-3">
                    Click on a buildable tile to construct this tower.
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>• Damage: {selectedTowerType.damage}</div>
                    <div>• Range: {selectedTowerType.range} units</div>
                    <div>• Attack Speed: {selectedTowerType.attackSpeed} attacks/sec</div>
                    <div>• Type: {selectedTowerType.attackType}</div>
                    {selectedTowerType.specialAbilities && selectedTowerType.specialAbilities.map((ability, index) => (
                      <div key={index}>• {ability.type}: {ability.value}{ability.duration ? `s` : ''}</div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setSelectedTowerType(null)}
                    className="mt-3 w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {/* Selected Entity Details */}
              {selectedEntity && !selectedTowerType && (
                <div 
                  className="mb-6 p-4 rounded-lg border"
                  style={{ 
                    borderColor: race.colors.primary + '60',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                  }}
                >
                  <h4 className="font-bold text-white mb-2">Selected {selectedEntity.type}</h4>
                  <div className="text-sm text-gray-300 mb-3">
                    Position: ({selectedEntity.gridPos.row}, {selectedEntity.gridPos.col})
                  </div>
                  
                  {selectedEntity.type === 'tower' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          // Upgrade tower logic would go here
                          console.log('Upgrade tower:', selectedEntity.id);
                        }}
                        className="w-full py-2 text-sm rounded transition-colors"
                        style={{
                          backgroundColor: race.colors.secondary,
                          color: 'white'
                        }}
                      >
                        Upgrade Tower
                      </button>
                      
                      <button
                        onClick={() => {
                          removeEntity(selectedEntity.id);
                          setSelectedEntity(null);
                          setResources(prev => prev + 50); // Refund some resources
                          
                          // Remover torre del sistema de combate
                          if (combatSystemRef.current) {
                            combatSystemRef.current.removeTower(selectedEntity.id);
                          }
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                      >
                        Sell Tower (+$50)
                      </button>
                    </div>
                  )}

                  {selectedEntity.type === 'enemy' && selectedEntity.enemyData && (
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>Health: {selectedEntity.enemyData.health}/{selectedEntity.enemyData.maxHealth}</div>
                      <div>Size: {selectedEntity.enemyData.size}</div>
                      {selectedEntity.enemyData.statusEffects.length > 0 && (
                        <div>
                          Effects: {selectedEntity.enemyData.statusEffects.map(e => e.type).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="mt-3 w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    Deselect
                  </button>
                </div>
              )}
              
              {/* Controls */}
              <div className="space-y-3">
                <button
                  onClick={handleNextWave}
                  disabled={enemyStats.queuedSpawns > 0 || enemyStats.totalAlive > 0}
                  className={`w-full py-3 font-bold rounded-lg transition-all duration-200 
                    ${(enemyStats.queuedSpawns === 0 && enemyStats.totalAlive === 0) 
                      ? 'hover:scale-105' 
                      : 'opacity-50 cursor-not-allowed'}`}
                  style={{
                    background: (enemyStats.queuedSpawns === 0 && enemyStats.totalAlive === 0)
                      ? `linear-gradient(135deg, ${race.colors.primary}, ${race.colors.secondary})`
                      : '#4a4a4a',
                    color: 'white'
                  }}
                >
                  Start Wave {wave + 1}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handlePauseToggle}
                    className="py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    {gameState === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
                  </button>
                  <button 
                    onClick={() => {
                      // Speed toggle logic - placeholder
                      console.log('Speed toggled');
                    }}
                    className="py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    ⚡ 2x Speed
                  </button>
                </div>
              </div>
              
              {/* Game Stats */}
              <div 
                className="mt-6 p-3 rounded-lg border text-center"
                style={{ borderColor: race.colors.secondary + '40' }}
              >
                <div className="text-xs text-gray-400 mb-2">Battle Statistics</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-white">
                  <div>
                    <div className="font-bold">{entities.filter(e => e.type === 'tower').length}</div>
                    <div className="text-xs text-gray-400">Towers</div>
                  </div>
                  <div>
                    <div className="font-bold">{enemyStats.totalAlive}</div>
                    <div className="text-xs text-gray-400">Enemies</div>
                  </div>
                  <div>
                    <div className="font-bold">{enemyStats.queuedSpawns}</div>
                    <div className="text-xs text-gray-400">Queued</div>
                  </div>
                  <div>
                    <div className="font-bold">{combatStats.totalKills}</div>
                    <div className="text-xs text-gray-400">Kills</div>
                  </div>
                  <div>
                    <div className="font-bold">{combatStats.activeProjectiles}</div>
                    <div className="text-xs text-gray-400">Projectiles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
                    key={tower.id}
                    onClick={() => handleTowerSelect(tower)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 
                      hover:scale-105 ${selectedTowerType?.id === tower.id ? 'ring-2 ring-white ring-opacity-50' : ''}
                      ${resources >= tower.cost ? 'opacity-100' : 'opacity-50'}`}
                    style={{
                      backgroundColor: selectedTowerType?.id === tower.id ? race.colors.glow : 'rgba(0,0,0,0.4)',
                      borderColor: resources >= tower.cost ? race.colors.secondary + '60' : '#666'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{tower.name}</div>
                      <div 
                        className={`font-bold ${resources >= tower.cost ? 'text-yellow-400' : 'text-red-400'}`}
                      >
                        ${tower.cost}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      Damage: {tower.damage} | Range: {tower.range}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {tower.attackType.toUpperCase()} • {tower.attackSpeed} APS
                    </div>
                    {tower.specialAbilities && tower.specialAbilities.length > 0 && (
                      <div className="text-xs" style={{ color: race.colors.accent }}>
                        {tower.specialAbilities.map(ability => ability.type.toUpperCase()).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Selected Tower Details */}
              {selectedTowerType && (
                <div 
                  className="mt-6 p-4 rounded-lg border"
                  style={{ 
                    borderColor: race.colors.primary + '60',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                  }}
                >
                  <h4 className="font-bold text-white mb-2">{selectedTowerType.name}</h4>
                  <div className="text-sm text-gray-300 mb-3">
                    Click on a buildable tile to construct this tower.
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>• Damage: {selectedTowerType.damage}</div>
                    <div>• Range: {selectedTowerType.range} units</div>
                    <div>• Attack Speed: {selectedTowerType.attackSpeed} attacks/sec</div>
                    <div>• Type: {selectedTowerType.attackType}</div>
                    {selectedTowerType.specialAbilities && selectedTowerType.specialAbilities.map((ability, index) => (
                      <div key={index}>• {ability.type}: {ability.value}{ability.duration ? `s` : ''}</div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setSelectedTowerType(null)}
                    className="mt-3 w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {/* Selected Entity Details */}
              {selectedEntity && !selectedTowerType && (
                <div 
                  className="mt-6 p-4 rounded-lg border"
                  style={{ 
                    borderColor: race.colors.primary + '60',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                  }}
                >
                  <h4 className="font-bold text-white mb-2">Selected {selectedEntity.type}</h4>
                  <div className="text-sm text-gray-300 mb-3">
                    Position: ({selectedEntity.gridPos.row}, {selectedEntity.gridPos.col})
                  </div>
                  
                  {selectedEntity.type === 'tower' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          // Upgrade tower logic would go here
                          console.log('Upgrade tower:', selectedEntity.id);
                        }}
                        className="w-full py-2 text-sm rounded transition-colors"
                        style={{
                          backgroundColor: race.colors.secondary,
                          color: 'white'
                        }}
                      >
                        Upgrade Tower
                      </button>
                      
                      <button
                        onClick={() => {
                          removeEntity(selectedEntity.id);
                          setSelectedEntity(null);
                          setResources(prev => prev + 50); // Refund some resources
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                      >
                        Sell Tower (+$50)
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="mt-3 w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    Deselect
                  </button>
                </div>
              )}
              
              {/* Controls */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    // Next wave logic
                    setWave(prev => prev + 1);
                    console.log('Next wave started:', wave + 1);
                  }}
                  className="w-full py-3 font-bold rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${race.colors.primary}, ${race.colors.secondary})`,
                    color: 'white'
                  }}
                >
                  Start Wave {wave + 1}
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setGameState('paused')}
                    className="py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    ⏸️ Pause
                  </button>
                  <button 
                    onClick={() => {
                      // Speed toggle logic
                      console.log('Speed toggled');
                    }}
                    className="py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    ⚡ 2x Speed
                  </button>
                </div>
              </div>
              
              {/* Game Stats */}
              <div 
                className="mt-6 p-3 rounded-lg border text-center"
                style={{ borderColor: race.colors.secondary + '40' }}
              >
                <div className="text-xs text-gray-400 mb-1">Statistics</div>
                <div className="text-sm text-white">
                  Towers: {entities.filter(e => e.type === 'tower').length}
                </div>
                <div className="text-sm text-white">
                  Enemies: {entities.filter(e => e.type === 'enemy').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RaceKey, RACE_CONFIGS, GridPosition } from '../../types';
import { getTowersByRace, getBaseTowersByRace, TowerType } from '../../types/towers';
import { generateWavesForLevel } from '../../types/enemies';
import IsometricEngine, { useIsometricEngine, GameEntity } from './engine/IsometricEngine';
import { EnemyManager, EnemyInstance } from './engine/EnemySystem';
import { CombatSystem, TowerInstance, ProjectileInstance } from './engine/CombatSystem';

type BattleConfig = {
  race: RaceKey;
  level: number;
  raceConfig: any;
  enemyRaces: RaceKey[];
};

export default function BattleEngine({ config }: { config: BattleConfig }) {
  const [gameState, setGameState] = useState<'loading' | 'ready' | 'playing' | 'paused' | 'victory' | 'defeat'>('loading');
  const [resources, setResources] = useState(500);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<GameEntity | null>(null);
  
  // Sistema de enemigos y combate
  const enemyManagerRef = useRef<EnemyManager | null>(null);
  const combatSystemRef = useRef<CombatSystem | null>(null);
  const [enemyStats, setEnemyStats] = useState({ totalAlive: 0, totalSpawned: 0, queuedSpawns: 0 });
  const [combatStats, setCombatStats] = useState({ totalKills: 0, totalDamage: 0, activeProjectiles: 0 });
  
  // Hook del motor isométrico
  const { entities, addEntity, removeEntity, updateEntity, createVisualEffect } = useIsometricEngine();
  
  // Game loop
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Simular carga del juego
    const timer = setTimeout(() => {
      setGameState('ready');
      
      // Inicializar sistema de enemigos
      enemyManagerRef.current = new EnemyManager(config.race, config.level);
      enemyManagerRef.current.setCallbacks({
        onEnemyDeath: handleEnemyDeath,
        onEnemyReachedBase: handleEnemyReachedBase
      });

      // Inicializar sistema de combate
      combatSystemRef.current = new CombatSystem(enemyManagerRef.current);
      combatSystemRef.current.setCallbacks({
        onTowerAttack: handleTowerAttack,
        onProjectileHit: handleProjectileHit
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  // Manejar ataque de torre
  const handleTowerAttack = useCallback((tower: TowerInstance, target: EnemyInstance) => {
    const towerPos = { ...tower.gridPos, z: 20 };
    const targetPos = target.getPosition();
    
    // Crear efecto visual según tipo de ataque
    switch (tower.type.attackType) {
      case 'hitscan':
        createVisualEffect('energy_beam', towerPos, { 
          endPos: targetPos,
          color: tower.type.race === 'human' ? '#4a9eff' : 
                 tower.type.race === 'sliver' ? '#b455ff' : '#ffaa00'
        });
        break;
        
      case 'projectile':
        createVisualEffect('muzzle_flash', towerPos);
        break;
        
      case 'splash':
        createVisualEffect('muzzle_flash', towerPos);
        break;
        
      case 'chain':
        createVisualEffect('lightning', towerPos, { 
          endPos: targetPos,
          color: '#87ceeb'
        });
        break;
        
      case 'dot':
        createVisualEffect('poison_cloud', targetPos);
        break;
    }
  }, [createVisualEffect]);

  // Manejar impacto de proyectil
  const handleProjectileHit = useCallback((projectile: ProjectileInstance, enemy: EnemyInstance) => {
    const impactPos = enemy.getPosition();
    
    // Crear efecto de impacto
    switch (projectile.attackType) {
      case 'projectile':
        createVisualEffect('explosion', impactPos, { size: 'small' });
        break;
        
      case 'splash':
        createVisualEffect('explosion', impactPos, { size: 'medium' });
        break;
    }
  }, [createVisualEffect]);

  // Game loop principal
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = () => {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
        lastTimeRef.current = currentTime;

        // Actualizar sistema de enemigos
        if (enemyManagerRef.current) {
          enemyManagerRef.current.update(deltaTime);
          
          // Sincronizar enemigos con entidades del motor gráfico
          syncEnemiesWithEntities();
          
          // Actualizar stats
          setEnemyStats(enemyManagerRef.current.getStats());
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
      // Sincronizar proyectiles del CombatSystem con las entidades del motor gráfico
  const syncProjectilesWithEntities = () => {
    if (!combatSystemRef.current) return;

    const projectileRenderData = combatSystemRef.current.getProjectileRenderData();
    const currentProjectileEntities = entities.filter(e => e.type === 'projectile');
    
    // Remover entidades de proyectiles que ya no existen
    currentProjectileEntities.forEach(entity => {
      const stillExists = projectileRenderData.some(proj => `projectile_${proj.id}` === entity.id);
      if (!stillExists) {
        removeEntity(entity.id);
      }
    });

    // Agregar/actualizar entidades de proyectiles
    projectileRenderData.forEach(projectile => {
      const entityId = `projectile_${projectile.id}`;
      const existingEntity = entities.find(e => e.id === entityId);

      if (existingEntity) {
        // Actualizar entidad existente
        updateEntity(entityId, {
          gridPos: projectile.gridPos,
          projectileData: {
            progress: projectile.progress,
            rotation: projectile.rotation,
            spriteKey: projectile.spriteKey
          }
        });
      } else {
        // Agregar nueva entidad
        addEntity({
          gridPos: projectile.gridPos,
          type: 'projectile',
          sprite: projectile.spriteKey,
          zIndex: 2, // Por encima de las torres y enemigos
          projectileData: {
            progress: projectile.progress,
            rotation: projectile.rotation,
            spriteKey: projectile.spriteKey
          }
        });
      }
    });
  };

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  // Sincronizar enemigos del EnemyManager con las entidades del motor gráfico
  const syncEnemiesWithEntities = () => {
    if (!enemyManagerRef.current) return;

    const enemyRenderData = enemyManagerRef.current.getRenderData();
    const currentEnemyEntities = entities.filter(e => e.type === 'enemy');
    
    // Remover entidades de enemigos que ya no existen
    currentEnemyEntities.forEach(entity => {
      const stillExists = enemyRenderData.some(enemy => `enemy_${enemy.id}` === entity.id);
      if (!stillExists) {
        removeEntity(entity.id);
      }
    });

    // Agregar/actualizar entidades de enemigos
    enemyRenderData.forEach(enemy => {
      const entityId = `enemy_${enemy.id}`;
      const existingEntity = entities.find(e => e.id === entityId);

      if (existingEntity) {
        // Actualizar entidad existente
        updateEntity(entityId, {
          gridPos: enemy.gridPosition,
          enemyData: {
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            sprite: enemy.fallback, // Usar fallback para datos adicionales
            size: enemy.size,
            statusEffects: enemy.statusEffects.map(effect => ({
              type: effect.type,
              duration: effect.duration
            }))
          }
        });
      } else {
        // Agregar nueva entidad
        addEntity({
          gridPos: enemy.gridPosition,
          type: 'enemy',
          sprite: enemy.spriteKey, // Usar spriteKey en lugar de emoji
          zIndex: 1,
          enemyData: {
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            sprite: enemy.fallback, // Mantener fallback para casos sin sprite
            size: enemy.size,
            statusEffects: enemy.statusEffects.map(effect => ({
              type: effect.type,
              duration: effect.duration
            }))
          }
        });
      }
    });
  };

  // Manejar muerte de enemigo
  const handleEnemyDeath = useCallback((enemy: EnemyInstance) => {
    setResources(prev => prev + enemy.type.reward);
    setScore(prev => prev + enemy.type.reward * 10);
    
    console.log(`Enemy ${enemy.type.name} eliminated! +${enemy.type.reward} resources`);
  }, []);

  // Manejar enemigo que llegó a la base
  const handleEnemyReachedBase = useCallback((enemy: EnemyInstance) => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState('defeat');
      }
      return newLives;
    });
    
    console.log(`Enemy ${enemy.type.name} reached base! -1 life`);
  }, []);

  const race = config.raceConfig;
  const availableTowers = getBaseTowersByRace(config.race);

  const handleStartGame = () => {
    setGameState('playing');
    
    // Agregar algunas torres de ejemplo
    addEntity({
      gridPos: { row: 5, col: 5 },
      type: 'tower',
      sprite: 'tower_placeholder',
      zIndex: 1
    });
    
    // Iniciar primera oleada
    startWave(1);
  };

  // Iniciar una oleada de enemigos
  const startWave = (waveNumber: number) => {
    if (!enemyManagerRef.current) return;

    const waves = generateWavesForLevel(config.race, config.level);
    const currentWaveConfig = waves[waveNumber - 1];
    
    if (!currentWaveConfig) {
      // No hay más oleadas - victoria
      if (!enemyManagerRef.current.hasAliveEnemies()) {
        setGameState('victory');
      }
      return;
    }

    console.log(`Starting wave ${waveNumber}:`, currentWaveConfig);

    // Programar spawns de esta oleada
    currentWaveConfig.enemies.forEach(enemySpawn => {
      enemyManagerRef.current!.spawnEnemyWave(
        enemySpawn.enemyTypeId,
        enemySpawn.count,
        enemySpawn.interval,
        enemySpawn.delay
      );
    });
  };

  const handleTowerSelect = (tower: TowerType) => {
    setSelectedTowerType(tower);
    setSelectedEntity(null);
  };

  // Manejar click en tile del mapa
  const handleTileClick = useCallback((gridPos: GridPosition) => {
    if (gameState !== 'playing') return;
    
    if (selectedTowerType) {
      // Verificar si podemos construir aquí
      if (canBuildAt(gridPos) && resources >= selectedTowerType.cost) {
        // Construir torre
        const entityId = addEntity({
          gridPos,
          type: 'tower',
          sprite: selectedTowerType.spriteKey,
          zIndex: 1
        });
        
        setResources(prev => prev - selectedTowerType.cost);
        setSelectedTowerType(null);
        
        console.log(`Built ${selectedTowerType.name} at (${gridPos.row}, ${gridPos.col})`);
      }
    }
  }, [gameState, selectedTowerType, resources, addEntity]);

  // Manejar click en entidad
  const handleEntityClick = useCallback((entity: GameEntity) => {
    setSelectedEntity(entity);
    setSelectedTowerType(null);
    console.log('Selected entity:', entity);
  }, []);

  // Verificar si se puede construir en una posición
  const canBuildAt = (gridPos: GridPosition): boolean => {
    // Verificar si hay entidad en esta posición
    const hasEntity = entities.some(e => 
      e.gridPos.row === gridPos.row && e.gridPos.col === gridPos.col
    );
    
    // Verificar si está en el camino
    const isOnPath = enemyManagerRef.current?.getPath() && 
      enemyManagerRef.current.getPath().points.some(point => 
        point.gridPos.row === gridPos.row && point.gridPos.col === gridPos.col
      );
    
    return !hasEntity && !isOnPath && 
           gridPos.row >= 0 && gridPos.row < 15 && 
           gridPos.col >= 0 && gridPos.col < 20;
  };

  // Manejar siguiente oleada
  const handleNextWave = () => {
    const nextWave = wave + 1;
    setWave(nextWave);
    startWave(nextWave);
  };

  // Pausar/reanudar juego
  const handlePauseToggle = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      enemyManagerRef.current?.pause();
    } else if (gameState === 'paused') {
      setGameState('playing');
      enemyManagerRef.current?.resume();
      lastTimeRef.current = Date.now(); // Reset timer to avoid large delta
    }
  };

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
            Mission {config.level}: Prepare for incoming {config.enemyRaces.join(' & ')} forces
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
      
      {/* Overlay de preparación */}
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
              Deploy your {race.displayName} forces to defend against incoming{' '}
              {config.enemyRaces.map((r, i, arr) => (
                <span key={r}>
                  <span style={{ color: RACE_CONFIGS[r].colors.primary }}>
                    {RACE_CONFIGS[r].displayName}
                  </span>
                  {i < arr.length - 1 ? (i === arr.length - 2 ? ' and ' : ', ') : ''}
                </span>
              ))}{' '}
              forces. Use your strategic advantage and deploy towers wisely.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2" style={{ color: race.colors.primary }}>💰</div>
                <div className="text-white font-bold text-xl">{resources}</div>
                <div className="text-gray-400 text-sm">Resources</div>
              </div>
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2 text-red-400">❤️</div>
                <div className="text-white font-bold text-xl">{lives}</div>
                <div className="text-gray-400 text-sm">Lives</div>
              </div>
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2 text-yellow-400">⚡</div>
                <div className="text-white font-bold text-xl">{availableTowers.length}</div>
                <div className="text-gray-400 text-sm">Tower Types</div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
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

      {/* Victory Overlay */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-bold text-green-400 mb-4">VICTORY!</h2>
            <p className="text-xl text-gray-300 mb-6">Mission {config.level} Complete</p>
            <div className="text-lg text-white mb-8">
              <div>Score: {score}</div>
              <div>Resources: {resources}</div>
              <div>Lives Remaining: {lives}</div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
            >
              Return to Campaign
            </button>
          </div>
        </div>
      )}

      {/* Defeat Overlay */}
      {gameState === 'defeat' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl mb-6">💀</div>
            <h2 className="text-4xl font-bold text-red-400 mb-4">DEFEAT</h2>
            <p className="text-xl text-gray-300 mb-6">Base Destroyed</p>
            <div className="text-lg text-white mb-8">
              <div>Final Score: {score}</div>
              <div>Wave Reached: {wave}</div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setGameState('ready');
                  setResources(500);
                  setLives(20);
                  setWave(1);
                  setScore(0);
                  enemyManagerRef.current?.clear();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
              >
                Retry Mission
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg"
              >
                Return to Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="text-6xl mb-4">⏸️</div>
            <h3 className="text-2xl font-bold text-white mb-6">PAUSED</h3>
            <button
              onClick={handlePauseToggle}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Game Area - Motor Isométrico */}
      <div className="absolute inset-0 flex">
        
        {/* Main Game Area con Motor Isométrico */}
        <div className="flex-1 relative">
          <IsometricEngine
            race={config.race}
            level={config.level}
            onTileClick={handleTileClick}
            onEntityClick={handleEntityClick}
          >
            {/* Game Stats Overlay */}
            {(gameState === 'playing' || gameState === 'paused') && (
              <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
                <div className="flex gap-4">
                  <div 
                    className="bg-black/80 rounded-lg px-4 py-2 border backdrop-blur-sm"
                    style={{ borderColor: race.colors.secondary + '60' }}
                  >
                    <div className="text-yellow-400 font-bold text-lg">{resources}</div>
                    <div className="text-gray-300 text-sm">Resources</div>
                  </div>
                  <div className="bg-black/80 rounded-lg px-4 py-2 border border-red-600/60 backdrop-blur-sm">
                    <div className="text-red-400 font-bold text-lg">{lives}</div>
                    <div className="text-gray-300 text-sm">Lives</div>
                  </div>
                  <div className="bg-black/80 rounded-lg px-4 py-2 border border-blue-600/60 backdrop-blur-sm">
                    <div className="text-blue-400 font-bold text-lg">{wave}</div>
                    <div className="text-gray-300 text-sm">Wave</div>
                  </div>
                  <div className="bg-black/80 rounded-lg px-4 py-2 border border-purple-600/60 backdrop-blur-sm">
                    <div className="text-purple-400 font-bold text-lg">{enemyStats.totalAlive}</div>
                    <div className="text-gray-300 text-sm">Enemies</div>
                  </div>
                  <div className="bg-black/80 rounded-lg px-4 py-2 border border-green-600/60 backdrop-blur-sm">
                    <div className="text-green-400 font-bold text-lg">{score}</div>
                    <div className="text-gray-300 text-sm">Score</div>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="bg-black/80 rounded-lg px-4 py-2 border border-cyan-600/60 backdrop-blur-sm">
                  <div className="text-cyan-400 font-bold text-sm">
                    {gameState === 'paused' ? 'PAUSED' :
                     selectedTowerType ? `Building: ${selectedTowerType.name}` : 
                     selectedEntity ? `Selected: ${selectedEntity.type}` : 'Ready'}
                  </div>
                </div>
              </div>
            )}
          </IsometricEngine>
        </div>ricEngine();

  useEffect(() => {
    // Simular carga del juego
    const timer = setTimeout(() => {
      setGameState('ready');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const race = config.raceConfig;
  const availableTowers = getBaseTowersByRace(config.race);

  const handleStartGame = () => {
    setGameState('playing');
    
    // Agregar algunas entidades de ejemplo
    addEntity({
      gridPos: { row: 5, col: 5 },
      type: 'tower',
      sprite: 'tower_placeholder',
      zIndex: 1
    });
    
    addEntity({
      gridPos: { row: 8, col: 8 },
      type: 'enemy',
      sprite: 'enemy_placeholder', 
      zIndex: 1
    });
  };

  const handleTowerSelect = (tower: TowerType) => {
    setSelectedTowerType(tower);
    setSelectedEntity(null);
  };

  // Manejar click en tile del mapa
  const handleTileClick = useCallback((gridPos: GridPosition) => {
    if (gameState !== 'playing') return;
    
    if (selectedTowerType) {
      // Verificar si podemos construir aquí
      if (canBuildAt(gridPos) && resources >= selectedTowerType.cost) {
        // Construir torre
        const entityId = addEntity({
          gridPos,
          type: 'tower',
          sprite: selectedTowerType.spriteKey,
          zIndex: 1
        });
        
        setResources(prev => prev - selectedTowerType.cost);
        setSelectedTowerType(null);
        
        console.log(`Built ${selectedTowerType.name} at (${gridPos.row}, ${gridPos.col})`);
      }
    }
  }, [gameState, selectedTowerType, resources, addEntity]);

  // Manejar click en entidad
  const handleEntityClick = useCallback((entity: GameEntity) => {
    setSelectedEntity(entity);
    setSelectedTowerType(null);
    console.log('Selected entity:', entity);
  }, []);

  // Verificar si se puede construir en una posición
  const canBuildAt = (gridPos: GridPosition): boolean => {
    // No construir en el camino o donde ya hay algo
    const hasEntity = entities.some(e => 
      e.gridPos.row === gridPos.row && e.gridPos.col === gridPos.col
    );
    
    // Lógica simple: no construir en el camino principal (fila 7)
    const isPath = gridPos.row === 7;
    
    return !hasEntity && !isPath && 
           gridPos.row >= 0 && gridPos.row < 15 && 
           gridPos.col >= 0 && gridPos.col < 20;
  };

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
            Mission {config.level}: Prepare for incoming {config.enemyRaces.join(' & ')} forces
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
      
      {/* Overlay de preparación */}
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
              Deploy your {race.displayName} forces to defend against incoming{' '}
              {config.enemyRaces.map((r, i, arr) => (
                <span key={r}>
                  <span style={{ color: RACE_CONFIGS[r].colors.primary }}>
                    {RACE_CONFIGS[r].displayName}
                  </span>
                  {i < arr.length - 1 ? (i === arr.length - 2 ? ' and ' : ', ') : ''}
                </span>
              ))}{' '}
              forces. Use your strategic advantage and deploy towers wisely.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2" style={{ color: race.colors.primary }}>💰</div>
                <div className="text-white font-bold text-xl">{resources}</div>
                <div className="text-gray-400 text-sm">Resources</div>
              </div>
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2 text-red-400">❤️</div>
                <div className="text-white font-bold text-xl">{lives}</div>
                <div className="text-gray-400 text-sm">Lives</div>
              </div>
              <div 
                className="bg-black/40 rounded-lg p-4 border"
                style={{ borderColor: race.colors.secondary + '60' }}
              >
                <div className="text-3xl mb-2 text-yellow-400">⚡</div>
                <div className="text-white font-bold text-xl">{availableTowers.length}</div>
                <div className="text-gray-400 text-sm">Tower Types</div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
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

      {/* Game UI */}
      <div className="absolute inset-0 flex">
        
        {/* Main Game Area */}
        <div className="flex-1 relative">
          {/* Placeholder battlefield */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4" style={{ color: race.colors.primary }}>
                🎮
              </div>
              <div className="text-white text-2xl font-bold mb-2">
                Game Engine Loading...
              </div>
              <div className="text-gray-400">
                Isometric battlefield will render here
              </div>
            </div>
          </div>

          {/* Game Stats Overlay */}
          {gameState === 'playing' && (
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <div className="flex gap-4">
                <div 
                  className="bg-black/60 rounded-lg px-4 py-2 border backdrop-blur-sm"
                  style={{ borderColor: race.colors.secondary + '60' }}
                >
                  <div className="text-yellow-400 font-bold text-lg">{resources}</div>
                  <div className="text-gray-300 text-sm">Resources</div>
                </div>
                <div className="bg-black/60 rounded-lg px-4 py-2 border border-red-600/60 backdrop-blur-sm">
                  <div className="text-red-400 font-bold text-lg">{lives}</div>
                  <div className="text-gray-300 text-sm">Lives</div>
                </div>
                <div className="bg-black/60 rounded-lg px-4 py-2 border border-blue-600/60 backdrop-blur-sm">
                  <div className="text-blue-400 font-bold text-lg">{wave}</div>
                  <div className="text-gray-300 text-sm">Wave</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tower Selection Panel */}
        {gameState === 'playing' && (
          <div 
            className="w-80 bg-black/60 border-l backdrop-blur-sm"
            style={{ borderColor: race.colors.secondary + '60' }}
          >
            <div className="p-4">
              <h3 
                className="text-xl font-bold mb-4"
                style={{ color: race.colors.primary }}
              >
                {race.displayName} Arsenal
              </h3>
              
              <div className="space-y-3">
                {availableTowers.map((tower) => (
                  <div
                    key={tower.id}
                    onClick={() => handleTowerSelect(tower.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 
                      hover:scale-105 ${selectedTower === tower.id ? 'ring-2 ring-white ring-opacity-50' : ''}`}
                    style={{
                      backgroundColor: selectedTower === tower.id ? race.colors.glow : 'rgba(0,0,0,0.4)',
                      borderColor: race.colors.secondary + '60'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{tower.name}</div>
                      <div 
                        className="font-bold"
                        style={{ color: race.colors.accent }}
                      >
                        ${tower.cost}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      Damage: {tower.damage} | Range: {tower.range}
                    </div>
                    <div className="text-xs text-gray-400">
                      {tower.attackType.toUpperCase()} • {tower.attackSpeed} APS
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
