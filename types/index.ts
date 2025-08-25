// ========================================
// STARCRAFT TOWER DEFENSE - BASE TYPES
// ========================================

// Razas del juego
export type RaceKey = 'human' | 'sliver' | 'alien';

// Configuración de cada raza
export type RaceConfig = {
  key: RaceKey;
  name: string;
  displayName: string;
  theme: 'technology' | 'biological' | 'energy';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    glow: string;
  };
  description: string;
};

// Posiciones isométricas
export type IsometricPosition = {
  x: number;
  y: number;
  z: number; // Altura para efectos 3D
};

// Posición en grid del juego
export type GridPosition = {
  row: number;
  col: number;
};

// Estados de juego
export type GameState = 'menu' | 'playing' | 'paused' | 'victory' | 'defeat' | 'building';

// Configuración de nivel
export type LevelConfig = {
  id: number;
  name: string;
  race: RaceKey;
  difficulty: 'easy' | 'normal' | 'hard';
  waves: WaveConfig[];
  startingResources: number;
  baseHealth: number;
  mapLayout: MapLayout;
};

// Configuración de oleadas
export type WaveConfig = {
  id: number;
  enemies: EnemySpawnConfig[];
  delay: number; // Delay antes de la siguiente wave
};

// Spawn de enemigos
export type EnemySpawnConfig = {
  enemyType: string;
  count: number;
  interval: number; // Intervalo entre spawns
  path: number; // Qué path usar (para mapas multi-path)
};

// Layout del mapa
export type MapLayout = {
  width: number;
  height: number;
  paths: PathPoint[][];
  buildableAreas: GridPosition[];
  basePosition: GridPosition;
  spawnPoints: GridPosition[];
};

// Puntos del camino
export type PathPoint = {
  position: GridPosition;
  isoCords: IsometricPosition;
};

// ========================================
// TORRES
// ========================================

// Tipo de torre por raza
export type TowerType = {
  id: string;
  name: string;
  race: RaceKey;
  tier: 1 | 2 | 3; // Nivel de upgrade
  baseTower: string; // ID de la torre base (para upgrades)
  
  // Stats
  damage: number;
  range: number;
  attackSpeed: number; // Ataques por segundo
  cost: number;
  
  // Mecánicas especiales
  attackType: AttackType;
  specialAbilities?: SpecialAbility[];
  
  // Visuales
  spriteKey: string;
  projectileSprite?: string;
  effectSprite?: string;
  
  // Audio
  attackSound?: string;
  buildSound?: string;
};

// Tipos de ataque
export type AttackType = 
  | 'projectile'    // Proyectil directo
  | 'hitscan'      // Instantáneo (laser)
  | 'splash'       // Daño en área
  | 'chain'        // Cadena entre enemigos
  | 'dot'          // Damage over time
  | 'slow';        // Efecto de ralentización

// Habilidades especiales
export type SpecialAbility = {
  type: 'splash' | 'chain' | 'dot' | 'slow' | 'armor_pierce' | 'shield_drain';
  value: number; // Intensidad del efecto
  duration?: number; // Para efectos temporales
  radius?: number; // Para efectos de área
};

// Instancia de torre en el juego
export type Tower = {
  id: string;
  type: TowerType;
  position: GridPosition;
  isoPosition: IsometricPosition;
  level: number;
  currentTarget?: Enemy;
  lastAttackTime: number;
  kills: number;
  totalDamage: number;
};

// ========================================
// ENEMIGOS  
// ========================================

// Tipo de enemigo
export type EnemyType = {
  id: string;
  name: string;
  race: RaceKey; // De qué raza es el enemigo
  
  // Stats
  health: number;
  maxHealth: number;
  speed: number;
  armor: number;
  reward: number; // Recursos que da al morir
  
  // Resistencias
  resistances: Partial<Record<AttackType, number>>; // % de resistencia
  
  // Visuales
  spriteKey: string;
  size: 'small' | 'medium' | 'large';
  
  // Audio
  deathSound?: string;
  hitSound?: string;
};

// Instancia de enemigo en el juego
export type Enemy = {
  id: string;
  type: EnemyType;
  position: IsometricPosition;
  health: number;
  pathProgress: number; // 0-1, progreso en el camino
  pathIndex: number; // Qué camino está siguiendo
  statusEffects: StatusEffect[];
  isAlive: boolean;
};

// Efectos de estado en enemigos
export type StatusEffect = {
  type: 'dot' | 'slow' | 'armor_reduction' | 'stun';
  value: number;
  duration: number;
  source: string; // ID de la torre que causó el efecto
};

// ========================================
// GAME STATE
// ========================================

// Estado principal del juego
export type GameContext = {
  // Configuración
  level: LevelConfig;
  race: RaceKey;
  
  // Estado actual
  gameState: GameState;
  currentWave: number;
  resources: number;
  baseHealth: number;
  score: number;
  
  // Entidades
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  
  // UI
  selectedTowerType?: TowerType;
  selectedTower?: Tower;
  buildMode: boolean;
  
  // Timing
  gameTime: number;
  waveTimer: number;
  isPaused: boolean;
};

// Proyectiles
export type Projectile = {
  id: string;
  startPos: IsometricPosition;
  endPos: IsometricPosition;
  currentPos: IsometricPosition;
  target: Enemy;
  damage: number;
  speed: number;
  sprite: string;
  createdAt: number;
};

// ========================================
// CONSTANTES DE RAZAS
// ========================================

export const RACE_CONFIGS: Record<RaceKey, RaceConfig> = {
  human: {
    key: 'human',
    name: 'human',
    displayName: 'Human',
    theme: 'technology',
    colors: {
      primary: '#4a9eff',
      secondary: '#2d5aa0',
      accent: '#87ceeb', 
      background: 'from-blue-900 via-slate-900 to-gray-900',
      glow: '#4a9eff40'
    },
    description: 'Masters of technology and warfare. Deploy bunkers, missiles, and automated defenses.'
  },
  sliver: {
    key: 'sliver',
    name: 'sliver',
    displayName: 'Sliver',
    theme: 'biological',
    colors: {
      primary: '#b455ff',
      secondary: '#7a3db3',
      accent: '#da70d6',
      background: 'from-purple-900 via-slate-900 to-gray-900',
      glow: '#b455ff40'
    },
    description: 'Biological swarm creatures. Use living towers that grow and evolve over time.'
  },
  alien: {
    key: 'alien',
    name: 'alien',
    displayName: 'Alien',
    theme: 'energy',
    colors: {
      primary: '#ffaa00',
      secondary: '#cc7700',
      accent: '#ffd700',
      background: 'from-yellow-900 via-slate-900 to-gray-900',
      glow: '#ffaa0040'
    },
    description: 'Advanced psionic beings. Harness energy shields and devastating plasma weapons.'
  }
};