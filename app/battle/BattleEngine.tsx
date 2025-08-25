'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RaceKey, RACE_CONFIGS, GridPosition } from '../../types';
import { getBaseTowersByRace, TowerType } from '../../types/towers';
import { generateWavesForLevel } from '../../types/enemies';
import IsometricEngine, { useIsometricEngine, GameEntity } from './engine/IsometricEngine';
import { EnemyManager, EnemyInstance } from './engine/EnemySystem';
import { CombatSystem, TowerInstance, ProjectileInstance } from './engine/CombatSystem';

// Configuración recibida desde la página de batalla
export type BattleConfig = {
  race: RaceKey;
  level: number;
  raceConfig: any;
  enemyRaces: RaceKey[];
};

export default function BattleEngine({ config }: { config: BattleConfig }) {
  const [gameState, setGameState] = useState<
    'loading' | 'ready' | 'playing' | 'paused' | 'victory' | 'defeat'
  >('loading');
  const [resources, setResources] = useState(500);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<GameEntity | null>(null);

  // Sistemas principales
  const enemyManagerRef = useRef<EnemyManager | null>(null);
  const combatSystemRef = useRef<CombatSystem | null>(null);

  // Motor isométrico
  const { entities, addEntity, removeEntity, updateEntity, createVisualEffect } = useIsometricEngine();

  // Loop del juego
  const lastTimeRef = useRef<number>(0);
  const loopRef = useRef<number>();

  // Inicialización
  useEffect(() => {
    const timer = setTimeout(() => {
      enemyManagerRef.current = new EnemyManager(config.race, config.level);
      enemyManagerRef.current.setCallbacks({
        onEnemyDeath: handleEnemyDeath,
        onEnemyReachedBase: handleEnemyReachedBase
      });

      combatSystemRef.current = new CombatSystem(enemyManagerRef.current);
      combatSystemRef.current.setCallbacks({
        onTowerAttack: handleTowerAttack,
        onProjectileHit: handleProjectileHit
      });

      setGameState('ready');
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // run once

  // Efectos de ataque/impacto
  const handleTowerAttack = useCallback((tower: TowerInstance, target: EnemyInstance) => {
    const towerPos = { ...tower.gridPos, z: 20 };
    const targetPos = target.getPosition();

    if (tower.type.attackType === 'hitscan') {
      createVisualEffect('energy_beam', towerPos, { endPos: targetPos });
    } else {
      createVisualEffect('muzzle_flash', towerPos);
    }
  }, [createVisualEffect]);

  const handleProjectileHit = useCallback((projectile: ProjectileInstance, enemy: EnemyInstance) => {
    const impact = enemy.getPosition();
    createVisualEffect('explosion', impact, { size: 'small' });
  }, [createVisualEffect]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    lastTimeRef.current = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      enemyManagerRef.current?.update(dt);
      combatSystemRef.current?.update(dt);

      syncEnemiesWithEntities();
      syncProjectilesWithEntities();

      loopRef.current = requestAnimationFrame(loop);
    };

    loopRef.current = requestAnimationFrame(loop);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameState, entities]);

  // Sincronizar enemigos con motor gráfico
  const syncEnemiesWithEntities = () => {
    if (!enemyManagerRef.current) return;

    const renderData = enemyManagerRef.current.getRenderData();
    const existing = new Map(entities.filter(e => e.type === 'enemy').map(e => [e.id, e]));

    renderData.forEach(data => {
      const id = data.id;
      const gridPos = data.gridPosition;
      if (existing.has(id)) {
        updateEntity(id, { gridPos, screenPos: data.position, sprite: data.spriteKey, enemyData: {
          health: data.health,
          maxHealth: data.maxHealth,
          sprite: { emoji: data.fallback.emoji, color: data.fallback.color },
          size: data.size,
          statusEffects: data.statusEffects
        }});
        existing.delete(id);
      } else {
        addEntity({
          id,
          gridPos,
          screenPos: data.position,
          type: 'enemy',
          sprite: data.spriteKey,
          zIndex: 1,
          enemyData: {
            health: data.health,
            maxHealth: data.maxHealth,
            sprite: { emoji: data.fallback.emoji, color: data.fallback.color },
            size: data.size,
            statusEffects: data.statusEffects
          }
        });
      }
    });

    existing.forEach((_, id) => removeEntity(id));
  };

  // Sincronizar proyectiles
  const syncProjectilesWithEntities = () => {
    if (!combatSystemRef.current) return;

    const renderData = combatSystemRef.current.getProjectileRenderData();
    const existing = new Map(entities.filter(e => e.type === 'projectile').map(e => [e.id, e]));

    renderData.forEach(p => {
      const id = `projectile_${p.id}`;
      if (existing.has(id)) {
        updateEntity(id, { gridPos: p.gridPos, screenPos: p.position, sprite: p.spriteKey, projectileData: {
          progress: p.progress,
          rotation: p.rotation,
          spriteKey: p.spriteKey
        }});
        existing.delete(id);
      } else {
        addEntity({
          id,
          gridPos: p.gridPos,
          screenPos: p.position,
          type: 'projectile',
          sprite: p.spriteKey,
          zIndex: 2,
          projectileData: {
            progress: p.progress,
            rotation: p.rotation,
            spriteKey: p.spriteKey
          }
        });
      }
    });

    existing.forEach((_, id) => removeEntity(id));
  };

  // Callbacks del sistema de enemigos
  const handleEnemyDeath = useCallback((enemy: EnemyInstance) => {
    setResources(r => r + enemy.type.reward);
  }, []);

  const handleEnemyReachedBase = useCallback((enemy: EnemyInstance) => {
    setLives(l => {
      const nl = Math.max(0, l - 1);
      if (nl <= 0) setGameState('defeat');
      return nl;
    });
  }, []);

  // Inicio de partida y oleadas
  const handleStartGame = () => {
    setGameState('playing');
    setWave(1);
    startWave(1);
  };

  const startWave = (num: number) => {
    if (!enemyManagerRef.current) return;
    const waves = generateWavesForLevel(config.race, config.level);
    const w = waves[num - 1];
    if (!w) {
      if (!enemyManagerRef.current.hasAliveEnemies()) setGameState('victory');
      return;
    }
    w.enemies.forEach(spawn => {
      enemyManagerRef.current!.spawnEnemyWave(
        spawn.enemyTypeId,
        spawn.count,
        spawn.interval,
        spawn.delay
      );
    });
  };

  // Selección de torres y construcción
  const handleTowerSelect = (tower: TowerType) => {
    setSelectedTowerType(tower);
    setSelectedEntity(null);
  };

  const handleTileClick = useCallback((pos: GridPosition) => {
    if (gameState !== 'playing' || !selectedTowerType) return;
    if (!canBuildAt(pos) || resources < selectedTowerType.cost) return;

    const id = addEntity({ gridPos: pos, type: 'tower', sprite: selectedTowerType.spriteKey, zIndex: 1 });
    combatSystemRef.current?.addTower(id, selectedTowerType, pos);
    setResources(r => r - selectedTowerType.cost);
    setSelectedTowerType(null);
  }, [gameState, selectedTowerType, resources, addEntity]);

  const handleEntityClick = useCallback((entity: GameEntity) => {
    setSelectedEntity(entity);
    setSelectedTowerType(null);
  }, []);

  const canBuildAt = (pos: GridPosition): boolean => {
    const hasEntity = entities.some(e => e.gridPos.row === pos.row && e.gridPos.col === pos.col);
    const path = enemyManagerRef.current?.getPath().points ?? [];
    const onPath = path.some(p => p.gridPos.row === pos.row && p.gridPos.col === pos.col);
    return !hasEntity && !onPath;
  };

  const race = config.raceConfig;
  const availableTowers = getBaseTowersByRace(config.race);

  if (gameState === 'loading') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${race.colors.background} flex items-center justify-center`}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br ${race.colors.background} relative`}>
      {gameState === 'ready' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-4xl text-white mb-6">Mission {config.level}</h2>
            <button onClick={handleStartGame} className="px-8 py-4 bg-blue-600 text-white rounded-lg">
              Begin Mission
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex">
        <div className="flex-1 relative">
          <IsometricEngine
            race={config.race}
            level={config.level}
            onTileClick={handleTileClick}
            onEntityClick={handleEntityClick}
          />
          {gameState === 'playing' && (
            <div className="absolute top-4 left-4 flex gap-4 text-white">
              <div>💰 {resources}</div>
              <div>❤️ {lives}</div>
              <div>Wave {wave}</div>
            </div>
          )}
        </div>

        {gameState === 'playing' && (
          <div className="w-64 bg-black/70 text-white p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{race.displayName} Arsenal</h3>
            {availableTowers.map(tower => (
              <div
                key={tower.id}
                onClick={() => handleTowerSelect(tower)}
                className={`p-2 mb-2 border rounded cursor-pointer ${selectedTowerType?.id === tower.id ? 'bg-gray-700' : ''}`}
              >
                <div className="flex justify-between">
                  <span>{tower.name}</span>
                  <span>${tower.cost}</span>
                </div>
                <div className="text-xs text-gray-300">
                  DMG {tower.damage} • RNG {tower.range}
                </div>
              </div>
            ))}

            {selectedEntity && (
              <div className="mt-4 p-2 border rounded">
                Selected: {selectedEntity.type} ({selectedEntity.gridPos.row}, {selectedEntity.gridPos.col})
                <button onClick={() => setSelectedEntity(null)} className="mt-2 w-full bg-gray-600 rounded p-1">
                  Deselect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
