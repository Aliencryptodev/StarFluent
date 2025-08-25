// ========================================
// VISUAL EFFECTS SYSTEM
// ========================================

import { IsometricPosition, GridPosition } from '../../../types';
import { IsometricUtils } from './IsometricEngine';
import { SpriteManager } from './SpriteSystem';

export type VisualEffect = {
  id: string;
  type: 'explosion' | 'muzzle_flash' | 'impact' | 'lightning' | 'poison_cloud' | 'energy_beam';
  position: IsometricPosition;
  gridPos: GridPosition;
  duration: number;
  maxDuration: number;
  scale: number;
  rotation: number;
  alpha: number;
  spriteKey?: string;
  color?: string;
  particles?: ParticleEffect[];
  isAlive: boolean;
};

export type ParticleEffect = {
  id: string;
  position: IsometricPosition;
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
};

export class VisualEffectsSystem {
  private effects: Map<string, VisualEffect> = new Map();
  private particles: Map<string, ParticleEffect> = new Map();
  private spriteManager: SpriteManager;

  constructor() {
    this.spriteManager = SpriteManager.getInstance();
  }

  // Crear efecto de explosión
  createExplosion(position: IsometricPosition, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const gridPos = IsometricUtils.isoToGrid(position);
    
    const scaleMap = { small: 0.8, medium: 1.0, large: 1.5 };
    const durationMap = { small: 0.3, medium: 0.5, large: 0.8 };
    
    const effect: VisualEffect = {
      id: `explosion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'explosion',
      position: { ...position },
      gridPos,
      duration: durationMap[size],
      maxDuration: durationMap[size],
      scale: scaleMap[size],
      rotation: Math.random() * Math.PI * 2,
      alpha: 1.0,
      spriteKey: 'explosion',
      isAlive: true
    };

    // Crear partículas de explosión
    effect.particles = this.createExplosionParticles(position, size);

    this.effects.set(effect.id, effect);
    return effect.id;
  }

  // Crear efecto de rayo láser
  createEnergyBeam(startPos: IsometricPosition, endPos: IsometricPosition, color: string = '#00bfff'): string {
    const midPoint: IsometricPosition = {
      x: (startPos.x + endPos.x) / 2,
      y: (startPos.y + endPos.y) / 2,
      z: (startPos.z + endPos.z) / 2
    };
    
    const effect: VisualEffect = {
      id: `beam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'energy_beam',
      position: midPoint,
      gridPos: IsometricUtils.isoToGrid(midPoint),
      duration: 0.15,
      maxDuration: 0.15,
      scale: 1.0,
      rotation: Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x),
      alpha: 1.0,
      color,
      isAlive: true
    };

    this.effects.set(effect.id, effect);
    return effect.id;
  }

  // Crear efecto de destello de disparo
  createMuzzleFlash(position: IsometricPosition, rotation: number = 0): string {
    const effect: VisualEffect = {
      id: `muzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'muzzle_flash',
      position: { ...position },
      gridPos: IsometricUtils.isoToGrid(position),
      duration: 0.1,
      maxDuration: 0.1,
      scale: 0.5,
      rotation,
      alpha: 1.0,
      color: '#ffff00',
      isAlive: true
    };

    this.effects.set(effect.id, effect);
    return effect.id;
  }

  // Crear efecto de nube de veneno
  createPoisonCloud(position: IsometricPosition, radius: number = 60): string {
    const effect: VisualEffect = {
      id: `poison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'poison_cloud',
      position: { ...position },
      gridPos: IsometricUtils.isoToGrid(position),
      duration: 2.0,
      maxDuration: 2.0,
      scale: radius / 50,
      rotation: 0,
      alpha: 0.7,
      color: '#9d4edd',
      particles: this.createPoisonParticles(position, radius),
      isAlive: true
    };

    this.effects.set(effect.id, effect);
    return effect.id;
  }

  // Crear efecto de cadena eléctrica
  createLightningChain(positions: IsometricPosition[], color: string = '#87ceeb'): string {
    if (positions.length < 2) return '';

    const centerPos = positions.reduce((acc, pos) => ({
      x: acc.x + pos.x / positions.length,
      y: acc.y + pos.y / positions.length,
      z: acc.z + pos.z / positions.length
    }), { x: 0, y: 0, z: 0 });

    const effect: VisualEffect = {
      id: `lightning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'lightning',
      position: centerPos,
      gridPos: IsometricUtils.isoToGrid(centerPos),
      duration: 0.2,
      maxDuration: 0.2,
      scale: 1.0,
      rotation: 0,
      alpha: 1.0,
      color,
      isAlive: true
    };

    this.effects.set(effect.id, effect);
    return effect.id;
  }

  // Actualizar todos los efectos
  update(deltaTime: number): void {
    this.updateEffects(deltaTime);
    this.updateParticles(deltaTime);
  }

  // Actualizar efectos principales
  private updateEffects(deltaTime: number): void {
    const effectsToRemove: string[] = [];

    this.effects.forEach(effect => {
      effect.duration -= deltaTime;
      
      // Calcular alpha basado en tiempo restante
      const lifePercent = effect.duration / effect.maxDuration;
      
      switch (effect.type) {
        case 'explosion':
          effect.alpha = Math.max(0, lifePercent);
          effect.scale *= 1 + deltaTime * 2; // Expandir
          break;
          
        case 'muzzle_flash':
          effect.alpha = lifePercent;
          break;
          
        case 'energy_beam':
          effect.alpha = lifePercent * 2; // Fade rápido
          break;
          
        case 'poison_cloud':
          effect.alpha = 0.7 * lifePercent;
          effect.scale *= 1 + deltaTime * 0.5; // Expandir lentamente
          break;
          
        case 'lightning':
          effect.alpha = lifePercent * 3; // Fade muy rápido
          break;
      }

      // Actualizar partículas del efecto
      if (effect.particles) {
        effect.particles = effect.particles.filter(particle => {
          particle.life -= deltaTime;
          return particle.life > 0;
        });
      }

      // Marcar para eliminación si terminó
      if (effect.duration <= 0) {
        effectsToRemove.push(effect.id);
      }
    });

    effectsToRemove.forEach(id => {
      this.effects.delete(id);
    });
  }

  // Actualizar partículas individuales
  private updateParticles(deltaTime: number): void {
    const particlesToRemove: string[] = [];

    this.particles.forEach(particle => {
      // Actualizar posición
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.position.z += particle.velocity.z * deltaTime;
      
      // Actualizar vida
      particle.life -= deltaTime;
      particle.alpha = particle.life / particle.maxLife;
      
      // Aplicar gravedad a partículas
      particle.velocity.y += 50 * deltaTime; // Gravedad
      
      if (particle.life <= 0) {
        particlesToRemove.push(particle.id);
      }
    });

    particlesToRemove.forEach(id => {
      this.particles.delete(id);
    });
  }

  // Crear partículas de explosión
  private createExplosionParticles(position: IsometricPosition, size: 'small' | 'medium' | 'large'): ParticleEffect[] {
    const particleCount = { small: 5, medium: 10, large: 15 }[size];
    const particles: ParticleEffect[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 80 + Math.random() * 60;
      
      const particle: ParticleEffect = {
        id: `particle_${Date.now()}_${i}`,
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed - 30, // Inicial hacia arriba
          z: Math.random() * 20 - 10
        },
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.5 + Math.random() * 0.3,
        size: 3 + Math.random() * 4,
        color: ['#ff6b35', '#f7931e', '#ffcd3c', '#c5c5c5'][Math.floor(Math.random() * 4)],
        alpha: 1.0
      };
      
      particles.push(particle);
    }

    return particles;
  }

  // Crear partículas de veneno
  private createPoisonParticles(position: IsometricPosition, radius: number): ParticleEffect[] {
    const particleCount = Math.floor(radius / 10);
    const particles: ParticleEffect[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      
      const particle: ParticleEffect = {
        id: `poison_particle_${Date.now()}_${i}`,
        position: {
          x: position.x + Math.cos(angle) * distance,
          y: position.y + Math.sin(angle) * distance,
          z: position.z + Math.random() * 10
        },
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
          z: 10 + Math.random() * 10
        },
        life: 1.5 + Math.random() * 1.0,
        maxLife: 1.5 + Math.random() * 1.0,
        size: 2 + Math.random() * 3,
        color: ['#9d4edd', '#7209b7', '#560bad'][Math.floor(Math.random() * 3)],
        alpha: 0.7
      };
      
      particles.push(particle);
    }

    return particles;
  }

  // Renderizar todos los efectos
  renderEffects(ctx: CanvasRenderingContext2D): void {
    // Renderizar efectos principales
    this.effects.forEach(effect => {
      this.renderEffect(ctx, effect);
    });

    // Renderizar partículas independientes
    this.particles.forEach(particle => {
      this.renderParticle(ctx, particle);
    });
  }

  // Renderizar un efecto individual
  private renderEffect(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    if (!effect.isAlive || effect.alpha <= 0) return;

    const screenPos = IsometricUtils.gridToScreen(effect.gridPos);
    const { x, y } = screenPos;

    ctx.save();
    ctx.globalAlpha = effect.alpha;
    ctx.translate(x, y);
    ctx.rotate(effect.rotation);
    ctx.scale(effect.scale, effect.scale);

    switch (effect.type) {
      case 'explosion':
        this.renderExplosion(ctx, effect);
        break;
        
      case 'muzzle_flash':
        this.renderMuzzleFlash(ctx, effect);
        break;
        
      case 'energy_beam':
        this.renderEnergyBeam(ctx, effect);
        break;
        
      case 'poison_cloud':
        this.renderPoisonCloud(ctx, effect);
        break;
        
      case 'lightning':
        this.renderLightning(ctx, effect);
        break;
    }

    ctx.restore();

    // Renderizar partículas del efecto
    if (effect.particles) {
      effect.particles.forEach(particle => {
        this.renderParticle(ctx, particle);
      });
    }
  }

  // Renderizar explosión
  private renderExplosion(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    // Intentar usar sprite, si no está disponible usar fallback
    const spriteRendered = this.spriteManager.renderSprite(
      ctx, 
      'explosion', 
      0, 
      0, 
      { 
        scale: effect.scale, 
        rotation: effect.rotation,
        alpha: effect.alpha,
        centered: true 
      }
    );

    if (!spriteRendered) {
      // Fallback: círculos concéntricos
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      gradient.addColorStop(0, '#ffff00');
      gradient.addColorStop(0.3, '#ff6b35');
      gradient.addColorStop(0.7, '#ff0000');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Renderizar destello de disparo
  private renderMuzzleFlash(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    gradient.addColorStop(0, effect.color || '#ffff00');
    gradient.addColorStop(0.5, '#ff8c00');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Renderizar rayo de energía
  private renderEnergyBeam(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    ctx.strokeStyle = effect.color || '#00bfff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Efecto de glow
    ctx.shadowColor = effect.color || '#00bfff';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(50, 0);
    ctx.stroke();
    
    // Línea central más brillante
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.stroke();
  }

  // Renderizar nube de veneno
  private renderPoisonCloud(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    gradient.addColorStop(0, effect.color + '80' || '#9d4edd80');
    gradient.addColorStop(0.7, effect.color + '40' || '#9d4edd40');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // Renderizar rayo
  private renderLightning(ctx: CanvasRenderingContext2D, effect: VisualEffect): void {
    ctx.strokeStyle = effect.color || '#87ceeb';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Efecto de glow eléctrico
    ctx.shadowColor = effect.color || '#87ceeb';
    ctx.shadowBlur = 8;
    
    // Dibujar rayo en zigzag
    ctx.beginPath();
    ctx.moveTo(-30, -10);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-15, 5);
    ctx.lineTo(10, -5);
    ctx.lineTo(5, 10);
    ctx.lineTo(30, 0);
    ctx.stroke();
  }

  // Renderizar partícula individual
  private renderParticle(ctx: CanvasRenderingContext2D, particle: ParticleEffect): void {
    const screenPos = IsometricUtils.gridToScreen(IsometricUtils.isoToGrid(particle.position));
    
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // Obtener información de renderizado para efectos
  getEffectsRenderData() {
    return {
      effects: Array.from(this.effects.values()).map(effect => ({
        id: effect.id,
        type: effect.type,
        position: effect.position,
        gridPos: effect.gridPos,
        alpha: effect.alpha,
        scale: effect.scale,
        rotation: effect.rotation,
        color: effect.color
      })),
      particleCount: this.particles.size,
      effectCount: this.effects.size
    };
  }

  // Limpiar todos los efectos
  clear(): void {
    this.effects.clear();
    this.particles.clear();
  }

  // Pausar/reanudar efectos
  private isPaused: boolean = false;
  
  pause(): void {
    this.isPaused = true;
  }
  
  resume(): void {
    this.isPaused = false;
  }

  // Crear efecto basado en tipo de ataque
  createAttackEffect(
    attackType: string,
    startPos: IsometricPosition,
    endPos?: IsometricPosition,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    switch (attackType) {
      case 'projectile':
        return this.createMuzzleFlash(startPos);
        
      case 'hitscan':
        if (endPos) {
          return this.createEnergyBeam(startPos, endPos);
        }
        break;
        
      case 'splash':
        if (endPos) {
          return this.createExplosion(endPos, size);
        }
        break;
        
      case 'chain':
        if (endPos) {
          return this.createLightningChain([startPos, endPos]);
        }
        break;
        
      case 'dot':
        return this.createPoisonCloud(startPos);
        
      default:
        return this.createMuzzleFlash(startPos);
    }
    
    return '';
  }

  // Obtener estadísticas de efectos
  getStats() {
    return {
      activeEffects: this.effects.size,
      activeParticles: this.particles.size,
      totalParticlesInEffects: Array.from(this.effects.values())
        .reduce((total, effect) => total + (effect.particles?.length || 0), 0)
    };
  }
}