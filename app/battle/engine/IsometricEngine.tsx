'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GridPosition, IsometricPosition, RaceKey } from '../../../types';
import { SpriteManager } from './SpriteSystem';
import { VisualEffectsSystem } from './VisualEffectsSystem';

// Constantes del motor isométrico
export const ISO_CONSTANTS = {
  TILE_WIDTH: 64,
  TILE_HEIGHT: 32,
  GRID_WIDTH: 20,
  GRID_HEIGHT: 15,
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,
  // Proporción isométrica estándar
  ISO_RATIO: 0.5
} as const;

// Utilidades de conversión isométrica
export class IsometricUtils {
  // Convertir coordenadas de grid a isométricas
  static gridToIso(gridPos: GridPosition): IsometricPosition {
    const x = (gridPos.col - gridPos.row) * (ISO_CONSTANTS.TILE_WIDTH / 2);
    const y = (gridPos.col + gridPos.row) * (ISO_CONSTANTS.TILE_HEIGHT / 2);
    return { x, y, z: 0 };
  }

  // Convertir coordenadas isométricas a grid
  static isoToGrid(isoPos: IsometricPosition): GridPosition {
    const row = Math.floor((isoPos.y / ISO_CONSTANTS.TILE_HEIGHT - isoPos.x / ISO_CONSTANTS.TILE_WIDTH) / 2);
    const col = Math.floor((isoPos.y / ISO_CONSTANTS.TILE_HEIGHT + isoPos.x / ISO_CONSTANTS.TILE_WIDTH) / 2);
    return { row: Math.max(0, Math.min(ISO_CONSTANTS.GRID_HEIGHT - 1, row)), 
             col: Math.max(0, Math.min(ISO_CONSTANTS.GRID_WIDTH - 1, col)) };
  }

  // Convertir coordenadas del mouse a grid
  static mouseToGrid(mouseX: number, mouseY: number, canvasOffsetX: number = 0, canvasOffsetY: number = 0): GridPosition {
    // Ajustar por el offset del canvas y centrado
    const centerX = ISO_CONSTANTS.CANVAS_WIDTH / 2;
    const centerY = ISO_CONSTANTS.CANVAS_HEIGHT / 4;
    
    const adjustedX = mouseX - canvasOffsetX - centerX;
    const adjustedY = mouseY - canvasOffsetY - centerY;
    
    return this.isoToGrid({ x: adjustedX, y: adjustedY, z: 0 });
  }

  // Obtener posición de pantalla desde grid
  static gridToScreen(gridPos: GridPosition): { x: number; y: number } {
    const iso = this.gridToIso(gridPos);
    const centerX = ISO_CONSTANTS.CANVAS_WIDTH / 2;
    const centerY = ISO_CONSTANTS.CANVAS_HEIGHT / 4;
    
    return {
      x: centerX + iso.x,
      y: centerY + iso.y
    };
  }
}

// Tipos para el motor
export type TerrainTile = {
  gridPos: GridPosition;
  type: 'grass' | 'path' | 'buildable' | 'blocked' | 'spawn' | 'base';
  variant: number; // Para variaciones visuales
};

// Tipo de entidad actualizado para incluir proyectiles y efectos
export type GameEntity = {
  id: string;
  gridPos: GridPosition;
  screenPos: { x: number; y: number };
  type: 'tower' | 'enemy' | 'projectile' | 'effect';
  sprite: string;
  zIndex: number;
  // Datos adicionales para enemigos
  enemyData?: {
    health: number;
    maxHealth: number;
    sprite: { emoji: string; color: string };
    size: 'small' | 'medium' | 'large';
    statusEffects: Array<{ type: string; duration: number }>;
  };
  // Datos adicionales para proyectiles
  projectileData?: {
    progress: number;
    rotation: number;
    spriteKey: string;
  };
};

// Props del motor isométrico
type IsometricEngineProps = {
  race: RaceKey;
  level: number;
  onTileClick: (gridPos: GridPosition) => void;
  onEntityClick: (entity: GameEntity) => void;
  children?: React.ReactNode;
};

export default function IsometricEngine({
  race,
  level,
  onTileClick,
  onEntityClick,
  children
}: IsometricEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTile, setHoveredTile] = useState<GridPosition | null>(null);
  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [terrain, setTerrain] = useState<TerrainTile[]>([]);
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const spriteManager = SpriteManager.getInstance();
  const visualEffectsRef = useRef<VisualEffectsSystem>(new VisualEffectsSystem());

  // Generar terreno del mapa
  const generateTerrain = useCallback(() => {
    const tiles: TerrainTile[] = [];
    
    for (let row = 0; row < ISO_CONSTANTS.GRID_HEIGHT; row++) {
      for (let col = 0; col < ISO_CONSTANTS.GRID_WIDTH; col++) {
        let type: TerrainTile['type'] = 'grass';
        
        // Crear un camino simple en zigzag
        if (isPathTile(row, col)) {
          type = 'path';
        } else if (isSpawnPoint(row, col)) {
          type = 'spawn';
        } else if (isBasePoint(row, col)) {
          type = 'base';
        } else if (isBuildable(row, col)) {
          type = 'buildable';
        }
        
        tiles.push({
          gridPos: { row, col },
          type,
          variant: Math.floor(Math.random() * 3) // 0-2 para variaciones
        });
      }
    }
    
    setTerrain(tiles);
  }, [level]);

  // Lógica para determinar el tipo de tile
  const isPathTile = (row: number, col: number): boolean => {
    // Camino simple de izquierda a derecha con curvas
    if (row === 7) return col >= 0 && col <= 8;
    if (row === 6) return col >= 8 && col <= 10;
    if (row === 5) return col >= 10 && col <= 12;
    if (row === 6) return col >= 12 && col <= 14;
    if (row === 7) return col >= 14 && col <= 19;
    return false;
  };

  const isSpawnPoint = (row: number, col: number): boolean => {
    return row === 7 && col === 0;
  };

  const isBasePoint = (row: number, col: number): boolean => {
    return row === 7 && col === 19;
  };

  const isBuildable = (row: number, col: number): boolean => {
    return !isPathTile(row, col) && !isSpawnPoint(row, col) && !isBasePoint(row, col);
  };

  // Renderizar el canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderizar terreno
    terrain.forEach(tile => {
      renderTile(ctx, tile);
    });

    // Renderizar hover
    if (hoveredTile) {
      renderHoverEffect(ctx, hoveredTile);
    }

    // Renderizar entidades (torres, enemigos, etc.)
    const sortedEntities = [...entities].sort((a, b) => 
      a.gridPos.row - b.gridPos.row || a.zIndex - b.zIndex
    );
    
    sortedEntities.forEach(entity => {
      renderEntity(ctx, entity);
    });

    // Renderizar efectos visuales
    visualEffectsRef.current.renderEffects(ctx);

    // Renderizar grid de debug (opcional)
    if (process.env.NODE_ENV === 'development') {
      renderDebugGrid(ctx);
    }
  }, [terrain, entities, hoveredTile]);

  // Renderizar un tile individual
  const renderTile = (ctx: CanvasRenderingContext2D, tile: TerrainTile) => {
    const screenPos = IsometricUtils.gridToScreen(tile.gridPos);
    const { x, y } = screenPos;
    
    // Colores por tipo de tile
    const colors = {
      grass: ['#2d5016', '#3a6b1c', '#4a7c23'][tile.variant],
      path: ['#8b7355', '#a0845f', '#b49469'][tile.variant],
      buildable: ['#1a4c1a', '#236b23', '#2d7a2d'][tile.variant],
      blocked: '#4a4a4a',
      spawn: '#ff6b6b',
      base: '#4ecdc4'
    };

    ctx.fillStyle = colors[tile.type];
    
    // Dibujar tile isométrico (rombo)
    ctx.beginPath();
    ctx.moveTo(x, y - ISO_CONSTANTS.TILE_HEIGHT / 2);
    ctx.lineTo(x + ISO_CONSTANTS.TILE_WIDTH / 2, y);
    ctx.lineTo(x, y + ISO_CONSTANTS.TILE_HEIGHT / 2);
    ctx.lineTo(x - ISO_CONSTANTS.TILE_WIDTH / 2, y);
    ctx.closePath();
    ctx.fill();
    
    // Borde sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Renderizar efecto hover
  const renderHoverEffect = (ctx: CanvasRenderingContext2D, gridPos: GridPosition) => {
    const screenPos = IsometricUtils.gridToScreen(gridPos);
    const { x, y } = screenPos;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y - ISO_CONSTANTS.TILE_HEIGHT / 2);
    ctx.lineTo(x + ISO_CONSTANTS.TILE_WIDTH / 2, y);
    ctx.lineTo(x, y + ISO_CONSTANTS.TILE_HEIGHT / 2);
    ctx.lineTo(x - ISO_CONSTANTS.TILE_WIDTH / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Inicializar el motor y cargar sprites
  useEffect(() => {
    const initializeEngine = async () => {
      try {
        // Cargar sprites esenciales primero
        await spriteManager.preloadCoreSprites();
        
        // Cargar sprites específicos de la raza
        await spriteManager.loadRaceSprites(race);
        
        setSpritesLoaded(true);
        console.log('All sprites loaded successfully');
        
        // Generar terreno después de cargar sprites
        generateTerrain();
      } catch (error) {
        console.error('Error loading sprites:', error);
        // Continuar sin sprites (usará placeholders)
        setSpritesLoaded(false);
        generateTerrain();
      }
    };

    initializeEngine();
  }, [race, level, generateTerrain]);

  // Renderizar entidad con sprites reales
  const renderEntity = (ctx: CanvasRenderingContext2D, entity: GameEntity) => {
    const screenPos = IsometricUtils.gridToScreen(entity.gridPos);
    const { x, y } = screenPos;
    
    if (entity.type === 'enemy') {
      // Renderizado especial para enemigos con sprites reales
      const enemyData = entity.enemyData;
      if (enemyData) {
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + 5, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Renderizar sprite del enemigo
        const spriteRendered = spriteManager.renderSprite(
          ctx,
          entity.sprite,
          x,
          y - 15, // Elevar un poco del suelo
          {
            scale: enemyData.size === 'large' ? 1.2 : enemyData.size === 'medium' ? 1.0 : 0.8,
            centered: true
          }
        );

        // Si no se pudo renderizar sprite, usar fallback
        if (!spriteRendered && spritesLoaded) {
          // Fallback: círculo coloreado
          const radius = enemyData.size === 'large' ? 12 : enemyData.size === 'medium' ? 10 : 8;
          ctx.fillStyle = enemyData.sprite.color || '#ff6b6b';
          ctx.beginPath();
          ctx.arc(x, y - 10, radius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Barra de salud
        if (enemyData.health < enemyData.maxHealth) {
          renderHealthBar(ctx, x, y - 30, enemyData.health, enemyData.maxHealth);
        }
        
        // Efectos de estado
        if (enemyData.statusEffects && enemyData.statusEffects.length > 0) {
          renderStatusEffects(ctx, x, y - 35, enemyData.statusEffects);
        }
      }
    } else if (entity.type === 'projectile') {
      // Renderizar proyectil
      const projectileData = entity.projectileData;
      if (projectileData) {
        const spriteRendered = spriteManager.renderSprite(
          ctx,
          projectileData.spriteKey,
          x,
          y - 5,
          {
            scale: 0.8,
            rotation: projectileData.rotation,
            centered: true
          }
        );

        if (!spriteRendered) {
          // Fallback para proyectil
          ctx.fillStyle = '#ffd93d';
          ctx.beginPath();
          ctx.arc(x, y - 5, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (entity.type === 'tower') {
      // Renderizar sprite de torre
      const spriteRendered = spriteManager.renderSprite(
        ctx,
        entity.sprite,
        x,
        y - 20, // Torres más elevadas
        {
          scale: 1.0,
          centered: true
        }
      );

      // Si no se pudo renderizar sprite, usar fallback
      if (!spriteRendered) {
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(x, y - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else {
      // Otras entidades (proyectiles, efectos)
      const colors = {
        projectile: '#ffd93d',
        effect: '#ff8c42'
      };
      
      ctx.fillStyle = colors[entity.type as keyof typeof colors] || '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - 10, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Texto de debug
    if (process.env.NODE_ENV === 'development') {
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(entity.type, x, y - 45);
      
      // Mostrar sprite key si no está cargado
      if (entity.type === 'tower' || entity.type === 'enemy') {
        const isLoaded = spriteManager.isLoaded(entity.sprite);
        if (!isLoaded) {
          ctx.fillStyle = 'red';
          ctx.font = '8px Arial';
          ctx.fillText(`Missing: ${entity.sprite}`, x, y - 55);
        }
      }
    }
  };

  // Renderizar barra de salud
  const renderHealthBar = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number, maxHealth: number) => {
    const barWidth = 24;
    const barHeight = 4;
    const healthPercent = health / maxHealth;
    
    // Fondo de la barra
    ctx.fillStyle = 'rgba(100, 0, 0, 0.8)';
    ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
    
    // Salud actual
    const healthColor = healthPercent > 0.6 ? '#00ff00' : healthPercent > 0.3 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(x - barWidth / 2, y, barWidth * healthPercent, barHeight);
    
    // Borde de la barra
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
  };

  // Renderizar efectos de estado
  const renderStatusEffects = (ctx: CanvasRenderingContext2D, x: number, y: number, effects: Array<{ type: string; duration: number }>) => {
    let effectX = x - (effects.length * 8) / 2;
    effects.forEach(effect => {
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      
      const icon = getStatusEffectIcon(effect.type);
      ctx.strokeText(icon, effectX, y);
      ctx.fillText(icon, effectX, y);
      effectX += 12;
    });
  };

  // Helper para iconos de efectos de estado
  const getStatusEffectIcon = (effectType: string): string => {
    const icons = {
      dot: '🧪',
      slow: '🐌', 
      stun: '⚡',
      armor_reduction: '🛡️'
    };
    return icons[effectType as keyof typeof icons] || '?';
  };

  // Renderizar grid de debug
  const renderDebugGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let row = 0; row < ISO_CONSTANTS.GRID_HEIGHT; row++) {
      for (let col = 0; col < ISO_CONSTANTS.GRID_WIDTH; col++) {
        const screenPos = IsometricUtils.gridToScreen({ row, col });
        const { x, y } = screenPos;
        
        // Dibujar punto central
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x - 1, y - 1, 2, 2);
        
        // Coordenadas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${row},${col}`, x, y + 15);
      }
    }
  };

  // Manejar click del mouse
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const gridPos = IsometricUtils.mouseToGrid(mouseX, mouseY);
    
    // Verificar si hay una entidad en esta posición
    const entity = entities.find(e => 
      e.gridPos.row === gridPos.row && e.gridPos.col === gridPos.col
    );
    
    if (entity) {
      onEntityClick(entity);
    } else {
      onTileClick(gridPos);
    }
  }, [entities, onTileClick, onEntityClick]);

  // Manejar movimiento del mouse para hover
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const gridPos = IsometricUtils.mouseToGrid(mouseX, mouseY);
    
    // Solo actualizar si cambió la posición
    if (!hoveredTile || hoveredTile.row !== gridPos.row || hoveredTile.col !== gridPos.col) {
      setHoveredTile(gridPos);
    }
  }, [hoveredTile]);

  // Inicializar el motor
  useEffect(() => {
    generateTerrain();
  }, [generateTerrain]);

  // Renderizar en cada frame
  useEffect(() => {
    render();
  }, [render]);

  // Loop de renderizado con actualización de efectos
  useEffect(() => {
    let lastTime = performance.now();
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Actualizar efectos visuales
      visualEffectsRef.current.update(deltaTime);
      
      render();
      requestAnimationFrame(gameLoop);
    };
    
    const animationId = requestAnimationFrame(gameLoop);
    
    return () => cancelAnimationFrame(animationId);
  }, [render]);

  // Función para crear efectos desde componentes externos
  const createVisualEffect = useCallback((
    type: 'explosion' | 'muzzle_flash' | 'energy_beam' | 'lightning' | 'poison_cloud',
    position: IsometricPosition,
    options?: { size?: 'small' | 'medium' | 'large'; color?: string; endPos?: IsometricPosition }
  ) => {
    switch (type) {
      case 'explosion':
        return visualEffectsRef.current.createExplosion(position, options?.size);
      case 'muzzle_flash':
        return visualEffectsRef.current.createMuzzleFlash(position);
      case 'energy_beam':
        if (options?.endPos) {
          return visualEffectsRef.current.createEnergyBeam(position, options.endPos, options.color);
        }
        break;
      case 'lightning':
        if (options?.endPos) {
          return visualEffectsRef.current.createLightningChain([position, options.endPos], options.color);
        }
        break;
      case 'poison_cloud':
        return visualEffectsRef.current.createPoisonCloud(position);
    }
    return '';
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: 'crosshair' }}
    >
      <canvas
        ref={canvasRef}
        width={ISO_CONSTANTS.CANVAS_WIDTH}
        height={ISO_CONSTANTS.CANVAS_HEIGHT}
        className="absolute inset-0 w-full h-full object-contain"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredTile(null)}
      />
      
      {/* Overlay para UI adicional */}
      <div className="absolute inset-0 pointer-events-none">
        {children}
      </div>
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/60 text-white p-2 rounded text-sm font-mono">
          {hoveredTile && (
            <>
              Grid: ({hoveredTile.row}, {hoveredTile.col})
              <br />
              Tile: {terrain.find(t => t.gridPos.row === hoveredTile.row && t.gridPos.col === hoveredTile.col)?.type || 'unknown'}
              <br />
            </>
          )}
          Sprites: {spritesLoaded ? 'Loaded' : 'Loading...'}
          <br />
          {spriteManager.getLoadingProgress().percentage.toFixed(1)}% Complete
        </div>
      )}
    </div>
  );
}

// Hook para usar el motor desde componentes padre
export const useIsometricEngine = () => {
  const [entities, setEntities] = useState<GameEntity[]>([]);
  
  const addEntity = useCallback((entity: Omit<GameEntity, 'id' | 'screenPos'>) => {
    const newEntity: GameEntity = {
      ...entity,
      id: `entity_${Date.now()}_${Math.random()}`,
      screenPos: IsometricUtils.gridToScreen(entity.gridPos)
    };
    
    setEntities(prev => [...prev, newEntity]);
    return newEntity.id;
  }, []);
  
  const removeEntity = useCallback((entityId: string) => {
    setEntities(prev => prev.filter(e => e.id !== entityId));
  }, []);
  
  const updateEntity = useCallback((entityId: string, updates: Partial<GameEntity>) => {
    setEntities(prev => prev.map(e => 
      e.id === entityId 
        ? { 
            ...e, 
            ...updates, 
            screenPos: updates.gridPos ? IsometricUtils.gridToScreen(updates.gridPos) : e.screenPos 
          }
        : e
    ));
  }, []);
  
  return {
    entities,
    addEntity,
    removeEntity,
    updateEntity,
    createVisualEffect
  };
};