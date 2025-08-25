// ========================================
// SPRITE LOADING AND MANAGEMENT SYSTEM
// ========================================

import { RaceKey } from '../../../types';

export type SpriteData = {
  image: HTMLImageElement;
  width: number;
  height: number;
  loaded: boolean;
};

export class SpriteManager {
  private static instance: SpriteManager;
  private sprites: Map<string, SpriteData> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private loadedSprites = 0;
  private totalSprites = 0;

  static getInstance(): SpriteManager {
    if (!SpriteManager.instance) {
      SpriteManager.instance = new SpriteManager();
    }
    return SpriteManager.instance;
  }

  // Cargar un sprite individual
  async loadSprite(spriteKey: string, spritePath: string): Promise<HTMLImageElement> {
    // Si ya está cargado, devolverlo
    if (this.sprites.has(spriteKey)) {
      const spriteData = this.sprites.get(spriteKey)!;
      if (spriteData.loaded) {
        return spriteData.image;
      }
    }

    // Si ya está en proceso de carga, devolver la promesa existente
    if (this.loadingPromises.has(spriteKey)) {
      return this.loadingPromises.get(spriteKey)!;
    }

    // Crear nueva promesa de carga
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const spriteData: SpriteData = {
          image: img,
          width: img.width,
          height: img.height,
          loaded: true
        };
        
        this.sprites.set(spriteKey, spriteData);
        this.loadedSprites++;
        this.loadingPromises.delete(spriteKey);
        resolve(img);
      };
      
      img.onerror = () => {
        console.error(`Failed to load sprite: ${spritePath}`);
        this.loadingPromises.delete(spriteKey);
        reject(new Error(`Failed to load sprite: ${spritePath}`));
      };
      
      img.src = spritePath;
    });

    this.loadingPromises.set(spriteKey, loadPromise);
    this.totalSprites++;
    
    return loadPromise;
  }

  // Obtener un sprite cargado
  getSprite(spriteKey: string): SpriteData | null {
    return this.sprites.get(spriteKey) || null;
  }

  // Verificar si un sprite está cargado
  isLoaded(spriteKey: string): boolean {
    const sprite = this.sprites.get(spriteKey);
    return sprite ? sprite.loaded : false;
  }

  // Cargar todos los sprites de una raza
  async loadRaceSprites(race: RaceKey): Promise<void> {
    const spritePromises: Promise<HTMLImageElement>[] = [];

    // Cargar sprites de torres
    const towerSprites = this.getTowerSpriteKeys(race);
    towerSprites.forEach(spriteKey => {
      const path = `/assets/${race}/towers/${spriteKey}.png`;
      spritePromises.push(this.loadSprite(spriteKey, path));
    });

    // Cargar sprites de enemigos (todas las razas menos la del jugador)
    const allRaces: RaceKey[] = ['human', 'sliver', 'alien'];
    const enemyRaces = allRaces.filter(r => r !== race);
    
    enemyRaces.forEach(enemyRace => {
      const enemySprites = this.getEnemySpriteKeys(enemyRace);
      enemySprites.forEach(spriteKey => {
        const path = `/assets/${enemyRace}/enemies/${spriteKey}.png`;
        spritePromises.push(this.loadSprite(spriteKey, path));
      });
    });

    // Esperar a que todos los sprites se carguen
    try {
      await Promise.all(spritePromises);
      console.log(`Successfully loaded ${spritePromises.length} sprites for ${race} race`);
    } catch (error) {
      console.error(`Error loading sprites for ${race} race:`, error);
      throw error;
    }
  }

  // Obtener claves de sprites de torres por raza
  private getTowerSpriteKeys(race: RaceKey): string[] {
    const towerTypes = {
      human: ['bunker', 'missile', 'auto'],
      sliver: ['spine', 'spore', 'tumor'],
      alien: ['photon', 'tesla', 'psi']
    };

    const sprites: string[] = [];
    const types = towerTypes[race];
    
    types.forEach(type => {
      for (let level = 1; level <= 3; level++) {
        sprites.push(`${race}_${type}_${level}`);
      }
    });

    return sprites;
  }

  // Obtener claves de sprites de enemigos por raza
  private getEnemySpriteKeys(race: RaceKey): string[] {
    const enemyTypes = {
      human: ['marine', 'siege_tank'],
      sliver: ['zergling', 'hydralisk'],
      alien: ['zealot', 'dragoon']
    };

    return enemyTypes[race].map(type => `${race}_${type}`);
  }

  // Cargar sprites esenciales para el juego
  async preloadCoreSprites(): Promise<void> {
    const coreSprites = [
      // Efectos y proyectiles comunes
      { key: 'bullet', path: '/assets/effects/bullet.png' },
      { key: 'missile', path: '/assets/effects/missile.png' },
      { key: 'explosion', path: '/assets/effects/explosion.png' },
      { key: 'lightning', path: '/assets/effects/lightning.png' },
      // UI elementos
      { key: 'health_bar_bg', path: '/assets/ui/health_bar_bg.png' },
      { key: 'health_bar_fill', path: '/assets/ui/health_bar_fill.png' }
    ];

    const promises = coreSprites.map(sprite => 
      this.loadSprite(sprite.key, sprite.path).catch(err => {
        console.warn(`Optional sprite ${sprite.key} not found, using fallback`);
        return null;
      })
    );

    await Promise.allSettled(promises);
  }

  // Obtener progreso de carga
  getLoadingProgress(): { loaded: number; total: number; percentage: number } {
    return {
      loaded: this.loadedSprites,
      total: this.totalSprites,
      percentage: this.totalSprites > 0 ? (this.loadedSprites / this.totalSprites) * 100 : 0
    };
  }

  // Limpiar sprites de memoria (útil para cambiar de nivel/raza)
  clearSprites(): void {
    this.sprites.forEach(sprite => {
      // Liberar memoria de las imágenes
      sprite.image.src = '';
    });
    this.sprites.clear();
    this.loadingPromises.clear();
    this.loadedSprites = 0;
    this.totalSprites = 0;
  }

  // Obtener información de un sprite para renderizado
  getSpriteRenderInfo(spriteKey: string): {
    image: HTMLImageElement | null;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } {
    const sprite = this.getSprite(spriteKey);
    
    if (!sprite || !sprite.loaded) {
      return {
        image: null,
        width: 64,
        height: 64,
        centerX: 32,
        centerY: 32
      };
    }

    return {
      image: sprite.image,
      width: sprite.width,
      height: sprite.height,
      centerX: sprite.width / 2,
      centerY: sprite.height / 2
    };
  }

  // Renderizar sprite en canvas con posición y escala
  renderSprite(
    ctx: CanvasRenderingContext2D,
    spriteKey: string,
    x: number,
    y: number,
    options: {
      scale?: number;
      rotation?: number;
      flipX?: boolean;
      flipY?: boolean;
      alpha?: number;
      centered?: boolean;
    } = {}
  ): boolean {
    const sprite = this.getSprite(spriteKey);
    if (!sprite || !sprite.loaded) {
      // Fallback: dibujar un placeholder
      this.renderPlaceholder(ctx, x, y, options.scale || 1);
      return false;
    }

    const {
      scale = 1,
      rotation = 0,
      flipX = false,
      flipY = false,
      alpha = 1,
      centered = true
    } = options;

    ctx.save();

    // Configurar alpha
    if (alpha !== 1) {
      ctx.globalAlpha = alpha;
    }

    // Mover al punto de dibujo
    ctx.translate(x, y);

    // Aplicar rotación
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    // Aplicar escala y flip
    const scaleX = scale * (flipX ? -1 : 1);
    const scaleY = scale * (flipY ? -1 : 1);
    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }

    // Calcular posición de dibujo
    const drawX = centered ? -sprite.width / 2 : 0;
    const drawY = centered ? -sprite.height / 2 : 0;

    // Dibujar sprite
    ctx.drawImage(sprite.image, drawX, drawY, sprite.width, sprite.height);

    ctx.restore();
    return true;
  }

  // Renderizar placeholder cuando no hay sprite disponible
  private renderPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    const size = 32 * scale;
    ctx.fillStyle = '#666666';
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    // X placeholder
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size/4, y - size/4);
    ctx.lineTo(x + size/4, y + size/4);
    ctx.moveTo(x + size/4, y - size/4);
    ctx.lineTo(x - size/4, y + size/4);
    ctx.stroke();
  }

  // Verificar si todos los sprites críticos están cargados
  areSpritesReady(requiredSprites: string[]): boolean {
    return requiredSprites.every(spriteKey => this.isLoaded(spriteKey));
  }

  // Obtener estadísticas de memoria
  getMemoryStats(): { spritesLoaded: number; estimatedMemoryMB: number } {
    let totalPixels = 0;
    
    this.sprites.forEach(sprite => {
      if (sprite.loaded) {
        totalPixels += sprite.width * sprite.height;
      }
    });

    // Estimación aproximada: 4 bytes por pixel (RGBA)
    const estimatedBytes = totalPixels * 4;
    const estimatedMB = estimatedBytes / (1024 * 1024);

    return {
      spritesLoaded: this.sprites.size,
      estimatedMemoryMB: Math.round(estimatedMB * 100) / 100
    };
  }
}