// ========================================
// ENEMY MANAGEMENT SYSTEM
// ========================================

import { Enemy, EnemyType, StatusEffect, RaceKey } from '../../../types';
import { getEnemyById, getAllEnemiesForPlayer, getEnemySpriteInfo, calculateDamage } from '../../../types/enemies';
import { PathFollower, PathfindingSystem, GamePath } from './PathfindingSystem';
import { AttackType } from '../../../types';

export class EnemyInstance {
  public id: string;
  public type: EnemyType;
  public health: number;
  public maxHealth: number;
  public pathFollower: PathFollower;
  public statusEffects: StatusEffect[] = [];
  public isAlive: boolean = true;
  public baseSpeed: number;
  public currentSpeed: number;
  public lastDamageTime: number = 0;
  public spawnTime: number;

  constructor(enemyType: EnemyType, path: GamePath, spawnTime: number = 0) {
    this.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = { ...enemyType }; // Clone para evitar mutaciones
    this.health = enemyType.maxHealth;
    this.maxHealth = enemyType.maxHealth;
    this.baseSpeed = enemyType.speed;
    this.currentSpeed = enemyType.speed;
    this.spawnTime = spawnTime;
    
    this.pathFollower = new PathFollower(path, this.baseSpeed);
  }

  // Actualizar el enemigo
  update(deltaTime: number): void {
    if (!this.isAlive) return;
    // Actualizar efectos de estado
    this.updateStatusEffects(deltaTime);

    // Actualizar velocidad basada en efectos
    this.updateSpeed();

    // Actualizar movimiento
    this.pathFollower.update(deltaTime);

    // Verificar si llegó al final
    if (this.pathFollower.hasReachedEnd()) {
      // El enemigo llegó a la base - debería causar daño al jugador
      this.isAlive = false;
    }
  }

  // Actualizar efectos de estado
  private updateStatusEffects(deltaTime: number): void {
    this.statusEffects = this.statusEffects.filter(effect => {
      effect.duration -= deltaTime;

      // Aplicar efectos
      switch (effect.type) {
        case 'dot':
          // Damage over time - aplicar cada segundo aproximadamente
          const dotInterval = 1.0; // segundos
          if (effect.duration % dotInterval < deltaTime) {
            this.takeDamage(effect.value, 'dot', effect.source);
          }
          break;

        case 'slow':
          // Efecto de ralentización se maneja en updateSpeed()
          break;

        case 'stun':
          // Stun - detiene completamente el movimiento
          break;

        case 'armor_reduction':
          // Reducción de armadura - se aplica en takeDamage()
          break;
      }

      // Remover efecto si expiró
      return effect.duration > 0;
    });
  }

  // Actualizar velocidad basada en efectos
  private updateSpeed(): void {
    let speedMultiplier = 1.0;
    let isStunned = false;

    this.statusEffects.forEach(effect => {
      switch (effect.type) {
        case 'slow':
          speedMultiplier *= (1 - effect.value); // effect.value es 0-1
          break;
        case 'stun':
          isStunned = true;
          break;
      }
    });

    this.currentSpeed = isStunned ? 0 : this.baseSpeed * speedMultiplier;
    this.pathFollower.setSpeed(this.currentSpeed);
  }

  // Obtener información para renderizado
  getRenderInfo() {
    const spriteInfo = getEnemySpriteInfo(this.type);
    return {
      position: this.pathFollower.getCurrentPosition(),
      gridPosition: this.pathFollower.getCurrentGridPosition(),
      rotation: this.pathFollower.getRotation(),
      spriteKey: spriteInfo.spriteKey, // Usar spriteKey en lugar de sprite object
      health: this.health,
      maxHealth: this.maxHealth,
      statusEffects: this.statusEffects,
      size: this.type.size,
      isAlive: this.isAlive,
      // Mantener fallbacks para desarrollo
      fallback: {
        emoji: spriteInfo.emoji,
        color: spriteInfo.color
      }
    };
  }

  // Getters útiles
  getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }

  hasStatusEffect(type: StatusEffect['type']): boolean {
    return this.statusEffects.some(effect => effect.type === type);
  }

  getPosition() {
    return this.pathFollower.getCurrentPosition();
  }

  getGridPosition() {
    return this.pathFollower.getCurrentGridPosition();
  }

  // Recibir daño
  takeDamage(damage: number, attackType: AttackType, sourceId: string): boolean {
    if (!this.isAlive) return false;

    // Calcular daño real aplicando resistencias y armor
    const realDamage = calculateDamage(damage, attackType, this.type);

    this.health = Math.max(0, this.health - realDamage);
    this.lastDamageTime = Date.now();

    // Verificar si murió
    if (this.health <= 0) {
      this.isAlive = false;
      return true; // Enemigo eliminado
    }

    return false; // Enemigo dañado pero vivo
  }

  // Aplicar efecto de estado
  applyStatusEffect(effect: StatusEffect): void {
    // Verificar resistencias
    const resistance = this.type.resistances[effect.type] || 0;
    if (Math.random() < resistance) {
      return; // Resistió el efecto
    }

    // Buscar si ya tiene este efecto de la misma fuente
    const existingIndex = this.statusEffects.findIndex(e =>
      e.type === effect.type && e.source === effect.source
    );

    if (existingIndex >= 0) {
      // Refrescar duración o stackear valor
      const existing = this.statusEffects[existingIndex];
      if (effect.type === 'dot') {
        // Los DoTs se stackean
        existing.value += effect.value;
      } else {
        // Otros efectos se refrescan
        existing.value = Math.max(existing.value, effect.value);
      }
      existing.duration = effect.duration;
    } else {
      // Agregar nuevo efecto
      this.statusEffects.push({ ...effect });
    }
  }
}

// ========================================
// ENEMY MANAGER
// ========================================

export class EnemyManager {
  private enemies: Map<string, EnemyInstance> = new Map();
  private path: GamePath;
  private playerRace: RaceKey;
  private availableEnemyTypes: EnemyType[];
  private spawnQueue: Array<{ enemyTypeId: string; spawnTime: number }> = [];
  private currentTime: number = 0;
  
  // Callbacks
  private onEnemyReachedBase?: (enemy: EnemyInstance) => void;
  private onEnemyDeath?: (enemy: EnemyInstance) => void;

  constructor(playerRace: RaceKey, level: number) {
    this.playerRace = playerRace;
    this.path = PathfindingSystem.getInstance().getPathForLevel(level);
    this.availableEnemyTypes = getAllEnemiesForPlayer(playerRace);
  }

  // Configurar callbacks
  setCallbacks(callbacks: {
    onEnemyReachedBase?: (enemy: EnemyInstance) => void;
    onEnemyDeath?: (enemy: EnemyInstance) => void;
  }): void {
    this.onEnemyReachedBase = callbacks.onEnemyReachedBase;
    this.onEnemyDeath = callbacks.onEnemyDeath;
  }

  // Actualizar todos los enemigos
  update(deltaTime: number): void {
    this.currentTime += deltaTime;
    
    // Procesar cola de spawn
    this.processSpawnQueue();
    
    // Actualizar enemigos existentes
    const deadEnemies: string[] = [];
    const reachedBaseEnemies: string[] = [];
    
    this.enemies.forEach((enemy) => {
      const wasAlive = enemy.isAlive;
      const wasOnPath = !enemy.pathFollower.hasReachedEnd();
      
      enemy.update(deltaTime);
      
      // Verificar si murió
      if (wasAlive && !enemy.isAlive) {
        if (enemy.pathFollower.hasReachedEnd()) {
          // Llegó a la base
          reachedBaseEnemies.push(enemy.id);
        } else {
          // Fue eliminado por torres
          deadEnemies.push(enemy.id);
        }
      }
    });
    
    // Procesar enemigos muertos
    deadEnemies.forEach(enemyId => {
      const enemy = this.enemies.get(enemyId);
      if (enemy && this.onEnemyDeath) {
        this.onEnemyDeath(enemy);
      }
      this.enemies.delete(enemyId);
    });
    
    // Procesar enemigos que llegaron a la base
    reachedBaseEnemies.forEach(enemyId => {
      const enemy = this.enemies.get(enemyId);
      if (enemy && this.onEnemyReachedBase) {
        this.onEnemyReachedBase(enemy);
      }
      this.enemies.delete(enemyId);
    });
  }

  // Procesar cola de spawn
  private processSpawnQueue(): void {
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].spawnTime <= this.currentTime) {
      const spawnData = this.spawnQueue.shift()!;
      this.spawnEnemy(spawnData.enemyTypeId);
    }
  }

  // Spawnear un enemigo inmediatamente
  spawnEnemy(enemyTypeId: string): EnemyInstance | null {
    const enemyType = getEnemyById(enemyTypeId);
    if (!enemyType) {
      console.error(`Enemy type not found: ${enemyTypeId}`);
      return null;
    }

    const enemy = new EnemyInstance(enemyType, this.path, this.currentTime);
    this.enemies.set(enemy.id, enemy);
    
    return enemy;
  }

  // Programar spawn de enemigo
  scheduleEnemySpawn(enemyTypeId: string, spawnTime: number): void {
    this.spawnQueue.push({ enemyTypeId, spawnTime: this.currentTime + spawnTime });
    
    // Mantener la cola ordenada por tiempo de spawn
    this.spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);
  }

  // Spawnear múltiples enemigos con intervalo
  spawnEnemyWave(enemyTypeId: string, count: number, interval: number, delay: number = 0): void {
    for (let i = 0; i < count; i++) {
      const spawnTime = delay + (i * interval);
      this.scheduleEnemySpawn(enemyTypeId, spawnTime);
    }
  }

  // Aplicar daño a un enemigo específico
  damageEnemy(enemyId: string, damage: number, attackType: AttackType, sourceId: string): boolean {
    const enemy = this.enemies.get(enemyId);
    if (!enemy) return false;
    
    return enemy.takeDamage(damage, attackType, sourceId);
  }

  // Aplicar efecto de estado a un enemigo
  applyStatusEffectToEnemy(enemyId: string, effect: StatusEffect): void {
    const enemy = this.enemies.get(enemyId);
    if (enemy) {
      enemy.applyStatusEffect(effect);
    }
  }

  // Obtener enemigos en rango de una posición
  getEnemiesInRange(centerGridPos: { row: number; col: number }, range: number): EnemyInstance[] {
    const enemiesInRange: EnemyInstance[] = [];
    
    this.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      
      const enemyPos = enemy.getGridPosition();
      const distance = Math.sqrt(
        Math.pow(enemyPos.row - centerGridPos.row, 2) + 
        Math.pow(enemyPos.col - centerGridPos.col, 2)
      );
      
      if (distance <= range) {
        enemiesInRange.push(enemy);
      }
    });
    
    // Ordenar por distancia (más cercanos primero)
    return enemiesInRange.sort((a, b) => {
      const distA = Math.sqrt(
        Math.pow(a.getGridPosition().row - centerGridPos.row, 2) + 
        Math.pow(a.getGridPosition().col - centerGridPos.col, 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.getGridPosition().row - centerGridPos.row, 2) + 
        Math.pow(b.getGridPosition().col - centerGridPos.col, 2)
      );
      return distA - distB;
    });
  }

  // Obtener el enemigo más cercano a una posición
  getClosestEnemy(centerGridPos: { row: number; col: number }): EnemyInstance | null {
    const enemiesInRange = this.getEnemiesInRange(centerGridPos, Infinity);
    return enemiesInRange.length > 0 ? enemiesInRange[0] : null;
  }

  // Obtener todos los enemigos vivos
  getAliveEnemies(): EnemyInstance[] {
    return Array.from(this.enemies.values()).filter(enemy => enemy.isAlive);
  }

  // Obtener información de renderizado para todos los enemigos
  getRenderData() {
    return Array.from(this.enemies.values())
      .filter(enemy => enemy.isAlive)
      .map(enemy => ({
        id: enemy.id,
        ...enemy.getRenderInfo()
      }));
  }

  // Limpiar todos los enemigos
  clear(): void {
    this.enemies.clear();
    this.spawnQueue = [];
    this.currentTime = 0;
  }

  // Obtener estadísticas
  getStats() {
    const aliveEnemies = this.getAliveEnemies();
    const enemiesByType = new Map<string, number>();
    
    aliveEnemies.forEach(enemy => {
      const count = enemiesByType.get(enemy.type.id) || 0;
      enemiesByType.set(enemy.type.id, count + 1);
    });
    
    return {
      totalAlive: aliveEnemies.length,
      totalSpawned: this.enemies.size,
      queuedSpawns: this.spawnQueue.length,
      enemiesByType: Object.fromEntries(enemiesByType),
      currentTime: this.currentTime
    };
  }

  // Pausar/reanudar sistema
  private isPaused: boolean = false;
  
  pause(): void {
    this.isPaused = true;
  }
  
  resume(): void {
    this.isPaused = false;
  }
  
  isPausedState(): boolean {
    return this.isPaused;
  }

  // Obtener tipos de enemigos disponibles
  getAvailableEnemyTypes(): EnemyType[] {
    return [...this.availableEnemyTypes];
  }

  // Verificar si hay enemigos vivos
  hasAliveEnemies(): boolean {
    return this.getAliveEnemies().length > 0;
  }

  // Obtener el camino usado
  getPath(): GamePath {
    return this.path;
  }
}
