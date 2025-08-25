export type RaceKey = 'human' | 'sliver' | 'alien';

export type GridPosition = {
  row: number;
  col: number;
};

export type IsometricPosition = {
  x: number;
  y: number;
  z: number;
};

export type AttackType = 
  | 'projectile'
  | 'hitscan'
  | 'splash'
  | 'chain'
  | 'dot'
  | 'slow';

export type StatusEffect = {
  type: 'dot' | 'slow' | 'stun' | 'armor_reduction';
  value: number;
  duration: number;
  source: string;
};

export type TowerType = {
  id: string;
  name: string;
  race: RaceKey;
  tier: 1 | 2 | 3;
  baseTower: string;
  damage: number;
  range: number;
  attackSpeed: number;
  cost: number;
  attackType: AttackType;
  specialAbilities?: SpecialAbility[];
  spriteKey: string;
  projectileSprite?: string;
  effectSprite?: string;
  attackSound?: string;
  buildSound?: string;
};

export type EnemyType = {
  id: string;
  name: string;
  race: RaceKey;
  health: number;
  maxHealth: number;
  speed: number;
  armor: number;
  reward: number;
  resistances: Partial<Record<AttackType, number>>;
  spriteKey: string;
  size: 'small' | 'medium' | 'large';
  deathSound?: string;
  hitSound?: string;
};

export type Enemy = {
  id: string;
  type: EnemyType;
  position: IsometricPosition;
  health: number;
  pathProgress: number;
  pathIndex: number;
  statusEffects: StatusEffect[];
  isAlive: boolean;
};

export type SpecialAbility = {
  type: 'splash' | 'chain' | 'dot' | 'slow' | 'armor_pierce' | 'shield_drain' | 'stun';
  value: number;
  duration?: number;
  radius?: number;
};

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


