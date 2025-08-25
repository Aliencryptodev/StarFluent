// ========================================
// TOWER DEFINITIONS BY RACE
// ========================================

import { TowerType, RaceKey, AttackType } from './index';


// ========================================
// HUMAN TOWERS
// ========================================

export const HUMAN_TOWERS: TowerType[] = [
  // BUNKER - Infantería con ráfagas rápidas
  {
    id: 'human_bunker_1',
    name: 'Marine Bunker',
    race: 'human',
    tier: 1,
    baseTower: 'human_bunker',
    damage: 25,
    range: 120,
    attackSpeed: 2.5,
    cost: 100,
    attackType: 'projectile',
    spriteKey: 'human_bunker_1',
    projectileSprite: 'bullet',
    attackSound: 'marine_rifle'
  },
  {
    id: 'human_bunker_2', 
    name: 'Heavy Bunker',
    race: 'human',
    tier: 2,
    baseTower: 'human_bunker',
    damage: 45,
    range: 130,
    attackSpeed: 3.0,
    cost: 200,
    attackType: 'projectile',
    specialAbilities: [{ type: 'armor_pierce', value: 0.3 }],
    spriteKey: 'human_bunker_2',
    projectileSprite: 'heavy_bullet',
    attackSound: 'heavy_rifle'
  },
  {
    id: 'human_bunker_3',
    name: 'Elite Bunker', 
    race: 'human',
    tier: 3,
    baseTower: 'human_bunker',
    damage: 75,
    range: 140,
    attackSpeed: 3.5,
    cost: 400,
    attackType: 'projectile',
    specialAbilities: [
      { type: 'armor_pierce', value: 0.5 },
      { type: 'chain', value: 2, radius: 50 }
    ],
    spriteKey: 'human_bunker_3',
    projectileSprite: 'plasma_bullet',
    attackSound: 'plasma_rifle'
  },

  // MISSILE TURRET - Misiles con splash damage
  {
    id: 'human_missile_1',
    name: 'Basic Missile Turret',
    race: 'human',
    tier: 1,
    baseTower: 'human_missile',
    damage: 60,
    range: 150,
    attackSpeed: 1.0,
    cost: 150,
    attackType: 'splash',
    specialAbilities: [{ type: 'splash', value: 40, radius: 60 }],
    spriteKey: 'human_missile_1',
    projectileSprite: 'missile',
    effectSprite: 'explosion',
    attackSound: 'missile_launch'
  },
  {
    id: 'human_missile_2',
    name: 'Homing Missile Turret',
    race: 'human',
    tier: 2,
    baseTower: 'human_missile',
    damage: 100,
    range: 170,
    attackSpeed: 1.2,
    cost: 300,
    attackType: 'splash',
    specialAbilities: [{ type: 'splash', value: 70, radius: 80 }],
    spriteKey: 'human_missile_2',
    projectileSprite: 'homing_missile',
    effectSprite: 'big_explosion',
    attackSound: 'homing_launch'
  },
  {
    id: 'human_missile_3',
    name: 'Cluster Missile Turret',
    race: 'human',
    tier: 3,
    baseTower: 'human_missile',
    damage: 150,
    range: 180,
    attackSpeed: 1.5,
    cost: 500,
    attackType: 'splash',
    specialAbilities: [{ type: 'splash', value: 100, radius: 120 }],
    spriteKey: 'human_missile_3',
    projectileSprite: 'cluster_missile',
    effectSprite: 'cluster_explosion',
    attackSound: 'cluster_launch'
  },

  // AUTO-TURRET - Torretas automáticas de alta cadencia
  {
    id: 'human_auto_1',
    name: 'Single Auto-Turret',
    race: 'human',
    tier: 1,
    baseTower: 'human_auto',
    damage: 15,
    range: 100,
    attackSpeed: 4.0,
    cost: 80,
    attackType: 'hitscan',
    spriteKey: 'human_auto_1',
    attackSound: 'auto_gun'
  },
  {
    id: 'human_auto_2',
    name: 'Dual Auto-Turret',
    race: 'human',
    tier: 2,
    baseTower: 'human_auto',
    damage: 25,
    range: 110,
    attackSpeed: 5.0,
    cost: 160,
    attackType: 'hitscan',
    spriteKey: 'human_auto_2',
    attackSound: 'dual_auto_gun'
  },
  {
    id: 'human_auto_3',
    name: 'Quad Auto-Turret',
    race: 'human',
    tier: 3,
    baseTower: 'human_auto',
    damage: 40,
    range: 120,
    attackSpeed: 6.0,
    cost: 320,
    attackType: 'hitscan',
    specialAbilities: [{ type: 'armor_pierce', value: 0.4 }],
    spriteKey: 'human_auto_3',
    attackSound: 'quad_auto_gun'
  }
];

// ========================================
// SLIVER TOWERS
// ========================================

export const SLIVER_TOWERS: TowerType[] = [
  // SPINE CRAWLER - Ataques físicos + DOT ácido
  {
    id: 'sliver_spine_1',
    name: 'Basic Spine Crawler',
    race: 'sliver',
    tier: 1,
    baseTower: 'sliver_spine',
    damage: 35,
    range: 110,
    attackSpeed: 1.8,
    cost: 120,
    attackType: 'projectile',
    specialAbilities: [{ type: 'dot', value: 10, duration: 3 }],
    spriteKey: 'sliver_spine_1',
    projectileSprite: 'spine',
    attackSound: 'spine_shot'
  },
  {
    id: 'sliver_spine_2',
    name: 'Venomous Spine Crawler',
    race: 'sliver',
    tier: 2,
    baseTower: 'sliver_spine',
    damage: 50,
    range: 120,
    attackSpeed: 2.0,
    cost: 240,
    attackType: 'projectile',
    specialAbilities: [{ type: 'dot', value: 20, duration: 4 }],
    spriteKey: 'sliver_spine_2',
    projectileSprite: 'venom_spine',
    attackSound: 'venom_shot'
  },
  {
    id: 'sliver_spine_3',
    name: 'Toxic Spine Crawler',
    race: 'sliver',
    tier: 3,
    baseTower: 'sliver_spine',
    damage: 80,
    range: 130,
    attackSpeed: 2.2,
    cost: 400,
    attackType: 'projectile',
    specialAbilities: [
      { type: 'dot', value: 35, duration: 5 },
      { type: 'splash', value: 15, radius: 40 }
    ],
    spriteKey: 'sliver_spine_3',
    projectileSprite: 'toxic_spine',
    effectSprite: 'acid_splash',
    attackSound: 'toxic_shot'
  },

  // SPORE COLONY - Nubes de veneno que ralentizan
  {
    id: 'sliver_spore_1',
    name: 'Basic Spore Colony',
    race: 'sliver',
    tier: 1,
    baseTower: 'sliver_spore',
    damage: 20,
    range: 130,
    attackSpeed: 1.5,
    cost: 100,
    attackType: 'projectile',
    specialAbilities: [{ type: 'slow', value: 0.3, duration: 2 }],
    spriteKey: 'sliver_spore_1',
    projectileSprite: 'spore',
    effectSprite: 'spore_cloud',
    attackSound: 'spore_launch'
  },
  {
    id: 'sliver_spore_2',
    name: 'Toxic Cloud Colony',
    race: 'sliver',
    tier: 2,
    baseTower: 'sliver_spore',
    damage: 35,
    range: 140,
    attackSpeed: 1.7,
    cost: 200,
    attackType: 'splash',
    specialAbilities: [
      { type: 'slow', value: 0.5, duration: 3 },
      { type: 'splash', value: 25, radius: 70 }
    ],
    spriteKey: 'sliver_spore_2',
    projectileSprite: 'toxic_spore',
    effectSprite: 'toxic_cloud',
    attackSound: 'toxic_spore'
  },
  {
    id: 'sliver_spore_3',
    name: 'Plague Spore Colony',
    race: 'sliver',
    tier: 3,
    baseTower: 'sliver_spore',
    damage: 55,
    range: 150,
    attackSpeed: 2.0,
    cost: 350,
    attackType: 'splash',
    specialAbilities: [
      { type: 'slow', value: 0.7, duration: 4 },
      { type: 'dot', value: 25, duration: 6 },
      { type: 'splash', value: 40, radius: 90 }
    ],
    spriteKey: 'sliver_spore_3',
    projectileSprite: 'plague_spore',
    effectSprite: 'plague_cloud',
    attackSound: 'plague_launch'
  },

  // CREEP TUMOR - Regenera y fortalece otras torres
  {
    id: 'sliver_tumor_1',
    name: 'Basic Creep Tumor',
    race: 'sliver',
    tier: 1,
    baseTower: 'sliver_tumor',
    damage: 30,
    range: 90,
    attackSpeed: 2.2,
    cost: 90,
    attackType: 'dot',
    specialAbilities: [{ type: 'dot', value: 15, duration: 4 }],
    spriteKey: 'sliver_tumor_1',
    attackSound: 'creep_attack'
  },
  {
    id: 'sliver_tumor_2',
    name: 'Greater Creep Tumor',
    race: 'sliver',
    tier: 2,
    baseTower: 'sliver_tumor',
    damage: 45,
    range: 100,
    attackSpeed: 2.5,
    cost: 180,
    attackType: 'dot',
    specialAbilities: [{ type: 'dot', value: 25, duration: 5 }],
    spriteKey: 'sliver_tumor_2',
    attackSound: 'greater_creep'
  },
  {
    id: 'sliver_tumor_3',
    name: 'Hive Tumor',
    race: 'sliver',
    tier: 3,
    baseTower: 'sliver_tumor',
    damage: 70,
    range: 110,
    attackSpeed: 3.0,
    cost: 300,
    attackType: 'chain',
    specialAbilities: [
      { type: 'dot', value: 40, duration: 6 },
      { type: 'chain', value: 3, radius: 80 }
    ],
    spriteKey: 'sliver_tumor_3',
    attackSound: 'hive_attack'
  }
];

// ========================================
// ALIEN TOWERS
// ========================================

export const ALIEN_TOWERS: TowerType[] = [
  // PHOTON CANNON - Rayos de energía concentrada
  {
    id: 'alien_photon_1',
    name: 'Basic Photon Cannon',
    race: 'alien',
    tier: 1,
    baseTower: 'alien_photon',
    damage: 45,
    range: 125,
    attackSpeed: 1.8,
    cost: 140,
    attackType: 'hitscan',
    spriteKey: 'alien_photon_1',
    effectSprite: 'photon_beam',
    attackSound: 'photon_blast'
  },
  {
    id: 'alien_photon_2',
    name: 'Focused Photon Cannon',
    race: 'alien',
    tier: 2,
    baseTower: 'alien_photon',
    damage: 75,
    range: 135,
    attackSpeed: 2.0,
    cost: 280,
    attackType: 'hitscan',
    specialAbilities: [{ type: 'armor_pierce', value: 0.4 }],
    spriteKey: 'alien_photon_2',
    effectSprite: 'focused_beam',
    attackSound: 'focused_blast'
  },
  {
    id: 'alien_photon_3',
    name: 'Prismatic Cannon',
    race: 'alien',
    tier: 3,
    baseTower: 'alien_photon',
    damage: 120,
    range: 145,
    attackSpeed: 2.5,
    cost: 450,
    attackType: 'chain',
    specialAbilities: [
      { type: 'armor_pierce', value: 0.6 },
      { type: 'chain', value: 4, radius: 60 }
    ],
    spriteKey: 'alien_photon_3',
    effectSprite: 'prismatic_beam',
    attackSound: 'prismatic_blast'
  },

  // TESLA COIL - Cadenas eléctricas
  {
    id: 'alien_tesla_1',
    name: 'Basic Tesla Coil',
    race: 'alien',
    tier: 1,
    baseTower: 'alien_tesla',
    damage: 30,
    range: 115,
    attackSpeed: 2.0,
    cost: 110,
    attackType: 'chain',
    specialAbilities: [{ type: 'chain', value: 2, radius: 50 }],
    spriteKey: 'alien_tesla_1',
    effectSprite: 'lightning_arc',
    attackSound: 'tesla_zap'
  },
  {
    id: 'alien_tesla_2',
    name: 'Arc Tesla Coil',
    race: 'alien',
    tier: 2,
    baseTower: 'alien_tesla',
    damage: 50,
    range: 125,
    attackSpeed: 2.3,
    cost: 220,
    attackType: 'chain',
    specialAbilities: [{ type: 'chain', value: 3, radius: 70 }],
    spriteKey: 'alien_tesla_2',
    effectSprite: 'arc_lightning',
    attackSound: 'arc_zap'
  },
  {
    id: 'alien_tesla_3',
    name: 'Storm Tesla Coil',
    race: 'alien',
    tier: 3,
    baseTower: 'alien_tesla',
    damage: 85,
    range: 135,
    attackSpeed: 2.8,
    cost: 380,
    attackType: 'chain',
    specialAbilities: [
      { type: 'chain', value: 5, radius: 90 },
      { type: 'slow', value: 0.4, duration: 2 }
    ],
    spriteKey: 'alien_tesla_3',
    effectSprite: 'storm_lightning',
    attackSound: 'storm_zap'
  },

  // PSIONIC AMPLIFIER - Campos de energía que ralentizan/confunden
  {
    id: 'alien_psi_1',
    name: 'Mind Slow Amplifier',
    race: 'alien',
    tier: 1,
    baseTower: 'alien_psi',
    damage: 25,
    range: 140,
    attackSpeed: 1.5,
    cost: 120,
    attackType: 'slow',
    specialAbilities: [{ type: 'slow', value: 0.4, duration: 3 }],
    spriteKey: 'alien_psi_1',
    effectSprite: 'psi_field',
    attackSound: 'psi_wave'
  },
  {
    id: 'alien_psi_2',
    name: 'Psi Storm Amplifier',
    race: 'alien',
    tier: 2,
    baseTower: 'alien_psi',
    damage: 40,
    range: 150,
    attackSpeed: 1.8,
    cost: 240,
    attackType: 'splash',
    specialAbilities: [
      { type: 'slow', value: 0.6, duration: 4 },
      { type: 'splash', value: 30, radius: 80 }
    ],
    spriteKey: 'alien_psi_2',
    effectSprite: 'psi_storm',
    attackSound: 'psi_storm'
  },
  {
    id: 'alien_psi_3',
    name: 'Void Prison Amplifier',
    race: 'alien',
    tier: 3,
    baseTower: 'alien_psi',
    damage: 65,
    range: 160,
    attackSpeed: 2.2,
    cost: 400,
    attackType: 'splash',
    specialAbilities: [
      { type: 'slow', value: 0.8, duration: 5 },
      { type: 'splash', value: 50, radius: 100 },
      { type: 'stun', value: 1, duration: 1 }
    ],
    spriteKey: 'alien_psi_3',
    effectSprite: 'void_prison',
    attackSound: 'void_blast'
  }
];

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getTowersByRace(race: RaceKey): TowerType[] {
  switch (race) {
    case 'human': return HUMAN_TOWERS;
    case 'sliver': return SLIVER_TOWERS;
    case 'alien': return ALIEN_TOWERS;
  }
}

export function getBaseTowersByRace(race: RaceKey): TowerType[] {
  return getTowersByRace(race).filter(tower => tower.tier === 1);
}

export function getTowerUpgrades(baseTowerId: string): TowerType[] {
  const allTowers = [...HUMAN_TOWERS, ...SLIVER_TOWERS, ...ALIEN_TOWERS];
  const baseTower = allTowers.find(t => t.id === baseTowerId);
  if (!baseTower) return [];
  
  return allTowers.filter(t => 
    t.baseTower === baseTower.baseTower && 
    t.id !== baseTowerId
  ).sort((a, b) => a.tier - b.tier);
}

export function getTowerById(id: string): TowerType | undefined {
  const allTowers = [...HUMAN_TOWERS, ...SLIVER_TOWERS, ...ALIEN_TOWERS];
  return allTowers.find(tower => tower.id === id);

}
