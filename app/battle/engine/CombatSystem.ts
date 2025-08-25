// ========================================
// COMBAT AND TARGETING SYSTEM
// ========================================

import { GridPosition, IsometricPosition, AttackType, StatusEffect } from '../../../types';
import { TowerType } from '../../../types';
import { EnemyInstance, EnemyManager } from './EnemySystem';
import { IsometricUtils } from './IsometricEngine';

export type ProjectileInstance = {
  id: string;
  startPos: IsometricPosition;
  targetPos: IsometricPosition;
  currentPos: IsometricPosition;
  target: EnemyInstance | null;
  damage: number;
  attackType: AttackType;
  speed: number;
  spriteKey: string;
  sourceId: string;
  createdAt: number;
  progress: number; // 0-1
  specialAbilities?: Array<{ type: string; value: number; duration?: number; radius?: number }>;
  isAlive: boolean;
};

export type TowerInstance = {
  id: string;
  type: TowerType;
  gridPos: GridPosition;
  level: number;
  lastAttackTime: number;
  currentTarget: EnemyInstance | null;
  kills: number;
  totalDamage: number;
  isActive: boolean;
};

export class CombatSystem {
  private towers: Map<string, TowerInstance> = new Map();
  private projectiles: Map<string, ProjectileInstance> = new Map();
  private enemyManager: EnemyManager;
  private currentTime: number = 0;
  
  // Callbacks
  private onProjectileHit?: (projectile: ProjectileInstance, enemy: EnemyInstance) => void;
  private onTowerAttack?: (tower: TowerInstance, target: EnemyInstance) => void;

  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
  }

  // Configurar callbacks
  setCallbacks(callbacks: {
    onProjectileHit?: (projectile: ProjectileInstance, enemy: EnemyInstance) => void;
    onTowerAttack?: (tower: TowerInstance, target: EnemyInstance) => void;
  }): void {
    this.onProjectileHit = callbacks.onProjectileHit;
    this.onTowerAttack = callbacks.onTowerAttack;
  }

  // Agregar torre al sistema de combate
  addTower(id: string, towerType: TowerType, gridPos: GridPosition): TowerInstance {
    const tower: TowerInstance = {
      id,
      type: towerType,
      gridPos,
      level: towerType.tier,
      lastAttackTime: 0,
      currentTarget: null,
      kills: 0,
      totalDamage: 0,
      isActive: true
    };

    this.towers.set(id, tower);
    return tower;
  }

  // Remover torre del sistema
  removeTower(towerId: string): void {
    this.towers.delete(towerId);
  }

  // Actualizar sistema de combate
  update(deltaTime: number): void {
    this.currentTime += deltaTime;

    // Actualizar torres (targeting y ataques)
    this.towers.forEach(tower => {
      if (tower.isActive) {
        this.updateTower(tower, deltaTime);
      }
    });

    // Actualizar proyectiles
    this.updateProjectiles(deltaTime);
  }

  // Actualizar lógica de una torre individual
  private updateTower(tower: TowerInstance, deltaTime: number): void {
    // Verificar si puede atacar (cooldown)
    const attackCooldown = 1 / tower.type.attackSpeed; // segundos entre ataques
    const timeSinceLastAttack = this.currentTime - tower.lastAttackTime;
    
    if (timeSinceLastAttack < attackCooldown) {
      return; // Aún en cooldown
    }

    // Buscar objetivo
    const target = this.findTarget(tower);
    if (!target) {
      tower.currentTarget = null;
      return;
    }

    tower.currentTarget = target;

    // Realizar ataque según el tipo
    this.performAttack(tower, target);
    tower.lastAttackTime = this.currentTime;

    // Callback de ataque
    if (this.onTowerAttack) {
      this.onTowerAttack(tower, target);
    }
  }

  // Encontrar el mejor objetivo para una torre
  private findTarget(tower: TowerInstance): EnemyInstance | null {
    const enemiesInRange = this.enemyManager.getEnemiesInRange(
      tower.gridPos,
      tower.type.range / 32 // Convertir range de pixels a grid units
    );

    if (enemiesInRange.length === 0) {
      return null;
    }

    // Estrategia de targeting: enemigo más avanzado en el camino
    return enemiesInRange.reduce((best, current) => {
      return current.pathFollower.getProgress() > best.pathFollower.getProgress() ? current : best;
    });
  }

  // Realizar ataque según el tipo de torre
  private performAttack(tower: TowerInstance, target: EnemyInstance): void {
    const targetPos = target.getPosition();

    switch (tower.type.attackType) {
      case 'hitscan':
        // Ataque instantáneo (laser, photon cannon)
        this.performHitscanAttack(tower, target);
        break;

      case 'projectile':
        // Proyectil que viaja (bullets, spines)
        this.createProjectile(tower, target, targetPos);
        break;

      case 'splash':
        // Proyectil con área de efecto (missiles)
        this.createSplashProjectile(tower, target, targetPos);
        break;

      case 'chain':
        // Ataque en cadena (tesla coil)
        this.performChainAttack(tower, target);
        break;

      case 'dot':
        // Damage over time directo (creep tumor)
        this.performDotAttack(tower, target);
        break;

      case 'slow':
        // Efecto de ralentización (psi amplifier)
        this.performSlowAttack(tower, target);
        break;
    }
  }

  // Ataque instantáneo
  private performHitscanAttack(tower: TowerInstance, target: EnemyInstance): void {
    const killed = this.enemyManager.damageEnemy(target.id, tower.type.damage, 'hitscan', tower.id);
    
    if (killed) {
      tower.kills++;
    }
    tower.totalDamage += tower.type.damage;

    // Aplicar habilidades especiales
    tower.type.specialAbilities?.forEach(ability => {
      this.applySpecialAbility(ability, target, tower);
    });
  }

  // Crear proyectil normal
  private createProjectile(tower: TowerInstance, target: EnemyInstance, targetPos: IsometricPosition): void {
    const towerPos = IsometricUtils.gridToIso(tower.gridPos);
    
    const projectile: ProjectileInstance = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startPos: { ...towerPos, z: 20 }, // Elevar desde la torre
      targetPos: { ...targetPos, z: 10 }, // Objetivo a altura del enemigo
      currentPos: { ...towerPos, z: 20 },
      target,
      damage: tower.type.damage,
      attackType: tower.type.attackType,
      speed: 200, // pixels per second
      spriteKey: tower.type.projectileSprite || 'bullet',
      sourceId: tower.id,
      createdAt: this.currentTime,
      progress: 0,
      specialAbilities: tower.type.specialAbilities,
      isAlive: true
    };

    this.projectiles.set(projectile.id, projectile);
  }

  // Crear proyectil con splash damage
  private createSplashProjectile(tower: TowerInstance, target: EnemyInstance, targetPos: IsometricPosition): void {
    // Similar al proyectil normal pero con flag de splash
    this.createProjectile(tower, target, targetPos);
  }

  // Ataque en cadena
  private performChainAttack(tower: TowerInstance, target: EnemyInstance): void {
    const chainTargets = [target];
    const ability = tower.type.specialAbilities?.find(a => a.type === 'chain');
    const maxChains = ability?.value || 1;
    const chainRadius = ability?.radius || 50;

    // Encontrar objetivos adicionales para la cadena
    let currentTarget = target;
    for (let i = 1; i < maxChains; i++) {
      const nearbyEnemies = this.enemyManager.getEnemiesInRange(
        currentTarget.getGridPosition(),
        chainRadius / 32
      ).filter(enemy => 
        enemy.isAlive && 
        !chainTargets.includes(enemy) &&
        enemy.id !== currentTarget.id
      );

      if (nearbyEnemies.length > 0) {
        currentTarget = nearbyEnemies[0];
        chainTargets.push(currentTarget);
      } else {
        break;
      }
    }

    // Aplicar daño a todos los objetivos en la cadena
    chainTargets.forEach((chainTarget, index) => {
      const damage = Math.floor(tower.type.damage * Math.pow(0.8, index)); // Damage decays
      const killed = this.enemyManager.damageEnemy(chainTarget.id, damage, 'chain', tower.id);
      
      if (killed) {
        tower.kills++;
      }
      tower.totalDamage += damage;
    });
  }

  // Ataque DoT directo
  private performDotAttack(tower: TowerInstance, target: EnemyInstance): void {
    const killed = this.enemyManager.damageEnemy(target.id, tower.type.damage, 'dot', tower.id);
    
    if (killed) {
      tower.kills++;
    }
    tower.totalDamage += tower.type.damage;

    // Aplicar efecto DoT
    const dotAbility = tower.type.specialAbilities?.find(a => a.type === 'dot');
    if (dotAbility) {
      const dotEffect: StatusEffect = {
        type: 'dot',
        value: dotAbility.value,
        duration: dotAbility.duration || 3,
        source: tower.id
      };
      this.enemyManager.applyStatusEffectToEnemy(target.id, dotEffect);
    }
  }

  // Ataque de ralentización
  private performSlowAttack(tower: TowerInstance, target: EnemyInstance): void {
    // Damage mínimo
    const killed = this.enemyManager.damageEnemy(target.id, tower.type.damage, 'slow', tower.id);
    
    if (killed) {
      tower.kills++;
    }
    tower.totalDamage += tower.type.damage;

    // Aplicar efecto de slow
    const slowAbility = tower.type.specialAbilities?.find(a => a.type === 'slow');
    if (slowAbility) {
      const slowEffect: StatusEffect = {
        type: 'slow',
        value: slowAbility.value,
        duration: slowAbility.duration || 2,
        source: tower.id
      };
      this.enemyManager.applyStatusEffectToEnemy(target.id, slowEffect);
    }

    // Aplicar splash si lo tiene
    const splashAbility = tower.type.specialAbilities?.find(a => a.type === 'splash');
    if (splashAbility) {
      const nearbyEnemies = this.enemyManager.getEnemiesInRange(
        target.getGridPosition(),
        (splashAbility.radius || 50) / 32
      );

      nearbyEnemies.forEach(enemy => {
        if (enemy.id !== target.id) {
          this.enemyManager.applyStatusEffectToEnemy(enemy.id, {
            type: 'slow',
            value: slowAbility.value * 0.7, // Efecto reducido para splash
            duration: slowAbility.duration || 2,
            source: tower.id
          });
        }
      });
    }
  }

  // Aplicar habilidad especial
  private applySpecialAbility(
    ability: { type: string; value: number; duration?: number; radius?: number },
    target: EnemyInstance,
    tower: TowerInstance
  ): void {
    switch (ability.type) {
      case 'armor_pierce':
        // Ya se aplica en el cálculo de daño
        break;

      case 'dot':
        const dotEffect: StatusEffect = {
          type: 'dot',
          value: ability.value,
          duration: ability.duration || 3,
          source: tower.id
        };
        this.enemyManager.applyStatusEffectToEnemy(target.id, dotEffect);
        break;

      case 'slow':
        const slowEffect: StatusEffect = {
          type: 'slow',
          value: ability.value,
          duration: ability.duration || 2,
          source: tower.id
        };
        this.enemyManager.applyStatusEffectToEnemy(target.id, slowEffect);
        break;

      case 'splash':
        // Aplicar daño splash a enemigos cercanos
        const nearbyEnemies = this.enemyManager.getEnemiesInRange(
          target.getGridPosition(),
          (ability.radius || 50) / 32
        );

        nearbyEnemies.forEach(enemy => {
          if (enemy.id !== target.id) {
            const splashDamage = Math.floor(tower.type.damage * 0.6); // 60% del daño principal
            this.enemyManager.damageEnemy(enemy.id, splashDamage, tower.type.attackType, tower.id);
          }
        });
        break;
    }
  }

  // Actualizar proyectiles
  private updateProjectiles(deltaTime: number): void {
    const projectilesToRemove: string[] = [];

    this.projectiles.forEach(projectile => {
      if (!projectile.isAlive) {
        projectilesToRemove.push(projectile.id);
        return;
      }

      // Actualizar posición del proyectil
      projectile.progress += (projectile.speed * deltaTime) / this.getProjectileDistance(projectile);
      projectile.progress = Math.min(1, projectile.progress);

      // Interpolar posición
      projectile.currentPos = {
        x: projectile.startPos.x + (projectile.targetPos.x - projectile.startPos.x) * projectile.progress,
        y: projectile.startPos.y + (projectile.targetPos.y - projectile.startPos.y) * projectile.progress,
        z: projectile.startPos.z + (projectile.targetPos.z - projectile.startPos.z) * projectile.progress
      };

      // Verificar si llegó al objetivo
      if (projectile.progress >= 1) {
        this.handleProjectileHit(projectile);
        projectilesToRemove.push(projectile.id);
      }
      // Verificar si el objetivo murió
      else if (projectile.target && !projectile.target.isAlive) {
        projectilesToRemove.push(projectile.id);
      }
    });

    // Remover proyectiles terminados
    projectilesToRemove.forEach(id => {
      this.projectiles.delete(id);
    });
  }

  // Calcular distancia del proyectil
  private getProjectileDistance(projectile: ProjectileInstance): number {
    return Math.sqrt(
      Math.pow(projectile.targetPos.x - projectile.startPos.x, 2) +
      Math.pow(projectile.targetPos.y - projectile.startPos.y, 2) +
      Math.pow(projectile.targetPos.z - projectile.startPos.z, 2)
    );
  }

  // Manejar impacto de proyectil
  private handleProjectileHit(projectile: ProjectileInstance): void {
    if (!projectile.target || !projectile.target.isAlive) {
      return;
    }

    // Aplicar daño principal
    const killed = this.enemyManager.damageEnemy(
      projectile.target.id,
      projectile.damage,
      projectile.attackType,
      projectile.sourceId
    );

    // Actualizar estadísticas de la torre
    const tower = this.towers.get(projectile.sourceId);
    if (tower) {
      if (killed) {
        tower.kills++;
      }
      tower.totalDamage += projectile.damage;
    }

    // Aplicar habilidades especiales
    if (projectile.specialAbilities) {
      projectile.specialAbilities.forEach(ability => {
        this.applySpecialAbility(ability, projectile.target!, tower!);
      });
    }

    // Callback de impacto
    if (this.onProjectileHit) {
      this.onProjectileHit(projectile, projectile.target);
    }
  }

  // Obtener información de renderizado para proyectiles
  getProjectileRenderData() {
    return Array.from(this.projectiles.values())
      .filter(projectile => projectile.isAlive)
      .map(projectile => ({
        id: projectile.id,
        position: projectile.currentPos,
        gridPos: IsometricUtils.isoToGrid(projectile.currentPos),
        spriteKey: projectile.spriteKey,
        rotation: this.calculateProjectileRotation(projectile),
        progress: projectile.progress
      }));
  }

  // Calcular rotación del proyectil basada en dirección
  private calculateProjectileRotation(projectile: ProjectileInstance): number {
    const dx = projectile.targetPos.x - projectile.startPos.x;
    const dy = projectile.targetPos.y - projectile.startPos.y;
    return Math.atan2(dy, dx);
  }

  // Obtener estadísticas de torres
  getTowerStats() {
    const towers = Array.from(this.towers.values());
    return {
      totalTowers: towers.length,
      activeTowers: towers.filter(t => t.isActive).length,
      totalKills: towers.reduce((sum, t) => sum + t.kills, 0),
      totalDamage: towers.reduce((sum, t) => sum + t.totalDamage, 0),
      activeProjectiles: this.projectiles.size
    };
  }

  // Obtener torre por ID
  getTower(towerId: string): TowerInstance | undefined {
    return this.towers.get(towerId);
  }

  // Obtener todas las torres
  getAllTowers(): TowerInstance[] {
    return Array.from(this.towers.values());
  }

  // Pausar/reanudar sistema
  private isPaused: boolean = false;
  
  pause(): void {
    this.isPaused = true;
  }
  
  resume(): void {
    this.isPaused = false;
  }

  // Limpiar sistema
  clear(): void {
    this.towers.clear();
    this.projectiles.clear();
    this.currentTime = 0;
  }

  // Obtener información de targeting para debug
  getTargetingInfo(towerId: string): {
    tower: TowerInstance | null;
    target: EnemyInstance | null;
    enemiesInRange: EnemyInstance[];
    canAttack: boolean;
  } {
    const tower = this.towers.get(towerId);
    if (!tower) {
      return { tower: null, target: null, enemiesInRange: [], canAttack: false };
    }

    const enemiesInRange = this.enemyManager.getEnemiesInRange(
      tower.gridPos,
      tower.type.range / 32
    );

    const attackCooldown = 1 / tower.type.attackSpeed;
    const timeSinceLastAttack = this.currentTime - tower.lastAttackTime;
    const canAttack = timeSinceLastAttack >= attackCooldown;

    return {
      tower,
      target: tower.currentTarget,
      enemiesInRange,
      canAttack
    };
  }

}
