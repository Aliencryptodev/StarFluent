// ========================================

// ENEMY DEFINITIONS BY RACE
// ========================================

import { EnemyType, RaceKey, AttackType } from './index';

// ========================================
// HUMAN ENEMIES
// ========================================

export const HUMAN_ENEMIES: EnemyType[] = [
  // MARINE - Unidad básica rápida
  {
    id: 'human_marine',
    name: 'Marine',
    race: 'human',
    health: 80,
    maxHealth: 80,
    speed: 1.2,
    armor: 5,
    reward: 15,
    resistances: {
      projectile: 0.1 // 10% resistencia a proyectiles
    },
    spriteKey: 'human_marine',
    size: 'small',
    deathSound: 'marine_death',
    hitSound: 'marine_hit'
  },
  
  // SIEGE TANK - Unidad pesada lenta
  {
    id: 'human_siege_tank',
    name: 'Siege Tank',
    race: 'human',
    health: 200,
    maxHealth: 200,
    
    speed: 0.6,
    armor: 15,
    reward: 35,
    resistances: {
      projectile: 0.3, // 30% resistencia a proyectiles
      splash: 0.2      // 20% resistencia a splash
    },
    spriteKey: 'human_siege_tank',
    size: 'large',
    deathSound: 'tank_death',
    hitSound: 'tank_hit'
  }
];

// ========================================
// SLIVER ENEMIES
// ========================================

export const SLIVER_ENEMIES: EnemyType[] = [
  // ZERGLING - Unidad básica muy rápida
  {
    id: 'sliver_zergling',
    name: 'Zergling',
    race: 'sliver',
    health: 50,
    maxHealth: 50,
    speed: 1.8,
    armor: 0,
    reward: 12,
    resistances: {
      dot: 0.2 // 20% resistencia a damage over time
    },
    spriteKey: 'sliver_zergling',
    size: 'small',
    deathSound: 'zergling_death',
    hitSound: 'zergling_hit'
  },
  
  // HYDRALISK - Unidad media con resistencias
  {
    id: 'sliver_hydralisk',
    name: 'Hydralisk',
    race: 'sliver',
    health: 120,
    maxHealth: 120,
    speed: 1.0,
    armor: 8,
    reward: 25,
    resistances: {
      dot: 0.4,        // 40% resistencia a DoT
      projectile: 0.15 // 15% resistencia a proyectiles
    },
    spriteKey: 'sliver_hydralisk',
    size: 'medium',
    deathSound: 'hydralisk_death',
    hitSound: 'hydralisk_hit'
  }
];

// ========================================
// ALIEN ENEMIES
// ========================================

export const ALIEN_ENEMIES: EnemyType[] = [
  // ZEALOT - Unidad básica con escudos
  {
    id: 'alien_zealot',
    name: 'Zealot',
    race: 'alien',
    health: 100,
    maxHealth: 100,
    speed: 1.0,
    armor: 10,
    reward: 20,
    resistances: {
      chain: 0.25,  // 25% resistencia a chain lightning
      hitscan: 0.1  // 10% resistencia a hitscan
    },
    spriteKey: 'alien_zealot',
    size: 'medium',
    deathSound: 'zealot_death',
    hitSound: 'zealot_hit'
  },
  
  // DRAGOON - Unidad pesada con alta resistencia energética
  {
    id: 'alien_dragoon',
    name: 'Dragoon',
    race: 'alien',
    health: 180,
    maxHealth: 180,
    speed: 0.8,
    armor: 12,
    reward: 30,
    resistances: {
      chain: 0.5,   // 50% resistencia a chain lightning
      hitscan: 0.3, // 30% resistencia a hitscan
      slow: 0.4     // 40% resistencia a efectos de slow
    },
    spriteKey: 'alien_dragoon',
    size: 'large',
    deathSound: 'dragoon_death',
    hitSound: 'dragoon_hit'
  }
];

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getEnemiesByRace(race: RaceKey): EnemyType[] {
  switch (race) {
    case 'human': return HUMAN_ENEMIES;
    case 'sliver': return SLIVER_ENEMIES;
    case 'alien': return ALIEN_ENEMIES;
  }
}

export function getEnemyById(id: string): EnemyType | undefined {
  const allEnemies = [...HUMAN_ENEMIES, ...SLIVER_ENEMIES, ...ALIEN_ENEMIES];
  return allEnemies.find(enemy => enemy.id === id);
}

// Obtener enemigos que enfrentará una raza (las otras dos razas)
export function getEnemyRacesForPlayer(playerRace: RaceKey): RaceKey[] {
  return (['human', 'sliver', 'alien'] as RaceKey[]).filter(race => race !== playerRace);
}

// Obtener todos los enemigos que enfrentará una raza
export function getAllEnemiesForPlayer(playerRace: RaceKey): EnemyType[] {
  const enemyRaces = getEnemyRacesForPlayer(playerRace);
  return enemyRaces.flatMap(race => getEnemiesByRace(race));
}

// Configuración de oleadas por nivel
export type WaveEnemySpawn = {
  enemyTypeId: string;
  count: number;
  interval: number; // Segundos entre spawns de este tipo
  delay: number;    // Delay antes de empezar a spawnear este tipo
};

export type WaveConfiguration = {
  id: number;
  enemies: WaveEnemySpawn[];
  totalDuration: number; // Duración total estimada de la wave
  difficulty: number;    // 1-10 scale
};

// Generar configuración de waves para un nivel
export function generateWavesForLevel(playerRace: RaceKey, level: number): WaveConfiguration[] {
  const availableEnemies = getAllEnemiesForPlayer(playerRace);
  const waves: WaveConfiguration[] = [];
  
  // Configuración base que escala con el nivel
  const baseEnemyCount = Math.max(3, level);
  const waveCount = Math.min(3 + Math.floor(level / 2), 8); // Máximo 8 waves
  
  for (let waveIndex = 1; waveIndex <= waveCount; waveIndex++) {
    const waveEnemies: WaveEnemySpawn[] = [];
    
    // Wave 1: Solo enemigos básicos
    if (waveIndex === 1) {
      // Solo el primer enemigo de cada raza enemiga
      const basicEnemies = availableEnemies.filter(e => 
        e.id.endsWith('_marine') || e.id.endsWith('_zergling') || e.id.endsWith('_zealot')
      );
      
      basicEnemies.forEach((enemy, index) => {
        waveEnemies.push({
          enemyTypeId: enemy.id,
          count: baseEnemyCount + Math.floor(level / 3),
          interval: 1.5,
          delay: index * 2
        });
      });
    }
    // Waves posteriores: mezcla de básicos y avanzados
    else {
      availableEnemies.forEach((enemy, index) => {
        const isAdvanced = enemy.id.endsWith('_siege_tank') || 
                          enemy.id.endsWith('_hydralisk') || 
                          enemy.id.endsWith('_dragoon');
        
        const count = isAdvanced 
          ? Math.max(1, Math.floor((baseEnemyCount + level) / 3))
          : baseEnemyCount + Math.floor(level / 2);
          
        waveEnemies.push({
          enemyTypeId: enemy.id,
          count,
          interval: isAdvanced ? 2.5 : 1.2,
          delay: index * 1.5 + (waveIndex - 1) * 3
        });
      });
    }
    
    waves.push({
      id: waveIndex,
      enemies: waveEnemies,
      totalDuration: Math.max(waveEnemies.map(e => e.delay + (e.count * e.interval))),
      difficulty: Math.min(10, Math.floor(waveIndex + level / 2))
    });
  }
  
  return waves;
}

// Obtener colores temáticos por raza enemiga
export function getEnemyRaceColors(race: RaceKey) {
  const colors = {
    human: {
      primary: '#4a9eff',
      secondary: '#2d5aa0',
      health: '#00ff00'
    },
    sliver: {
      primary: '#b455ff',
      secondary: '#7a3db3', 
      health: '#ff6b6b'
    },
    alien: {
      primary: '#ffaa00',
      secondary: '#cc7700',
      health: '#00bfff'
    }
  };
  
  return colors[race];
}

// Calcular daño aplicando resistencias
export function calculateDamage(baseDamage: number, attackType: AttackType, enemy: EnemyType): number {
  const resistance = enemy.resistances[attackType] || 0;
  const damageMultiplier = Math.max(0, 1 - resistance);
  const armorReduction = Math.max(0, baseDamage - enemy.armor);
  
  return Math.floor(armorReduction * damageMultiplier);
}

// Obtener sprite placeholder basado en el tipo de enemigo
export function getEnemySpriteInfo(enemy: EnemyType) {
  // Ahora devolvemos la spriteKey para el sistema de sprites
  return {
    spriteKey: enemy.spriteKey,
    emoji: getEnemyEmoji(enemy.id), // Fallback para debug
    color: getEnemyColor(enemy.race)
  };
}


// Fallback emojis para debug/desarrollo
function getEnemyEmoji(enemyId: string): string {
  const emojiMap = {
    'human_marine': '🪖',
    'human_siege_tank': '🚗',
    'sliver_zergling': '🐺', 
    'sliver_hydralisk': '🐍',
    'alien_zealot': '⚔️',
    
    'alien_dragoon': '🤖'
  };
  
  return emojiMap[enemyId as keyof typeof emojiMap] || '❓';
}

// Colores por raza para fallbacks
funnction getEnemyColor(race: RaceKey): string {
  const colorMap = {
    human: '#4a9eff',
    sliver: '#b455ff',
    alien: '#ffaa00'
  };

  return colorMap[race];
}
