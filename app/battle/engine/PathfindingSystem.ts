// ========================================
// PATHFINDING AND MOVEMENT SYSTEM
// ========================================

import { GridPosition, IsometricPosition } from '../../../types';
import { ISO_CONSTANTS, IsometricUtils } from './IsometricEngine';

export type PathPoint = {
  gridPos: GridPosition;
  isoPos: IsometricPosition;
  screenPos: { x: number; y: number };
};

export type GamePath = {
  id: string;
  points: PathPoint[];
  totalLength: number;
  spawnPoint: PathPoint;
  basePoint: PathPoint;
};

export class PathfindingSystem {
  private static instance: PathfindingSystem;
  private paths: Map<string, GamePath> = new Map();
  
  static getInstance(): PathfindingSystem {
    if (!PathfindingSystem.instance) {
      PathfindingSystem.instance = new PathfindingSystem();
    }
    return PathfindingSystem.instance;
  }

  // Generar camino principal para un nivel
  generateMainPath(level: number): GamePath {
    const pathId = `main_path_${level}`;
    
    // Si ya existe, devolverlo
    if (this.paths.has(pathId)) {
      return this.paths.get(pathId)!;
    }

    // Generar puntos del camino basado en el nivel
    const gridPoints = this.generatePathPoints(level);
    const pathPoints: PathPoint[] = [];

    // Convertir puntos de grid a todas las coordenadas necesarias
    gridPoints.forEach(gridPos => {
      const isoPos = IsometricUtils.gridToIso(gridPos);
      const screenPos = IsometricUtils.gridToScreen(gridPos);
      
      pathPoints.push({
        gridPos,
        isoPos,
        screenPos
      });
    });

    // Calcular longitud total del camino
    let totalLength = 0;
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      const distance = Math.sqrt(
        Math.pow(curr.isoPos.x - prev.isoPos.x, 2) + 
        Math.pow(curr.isoPos.y - prev.isoPos.y, 2)
      );
      totalLength += distance;
    }

    const path: GamePath = {
      id: pathId,
      points: pathPoints,
      totalLength,
      spawnPoint: pathPoints[0],
      basePoint: pathPoints[pathPoints.length - 1]
    };

    this.paths.set(pathId, path);
    return path;
  }

  // Generar puntos específicos del camino basado en el nivel
  private generatePathPoints(level: number): GridPosition[] {
    // Diferentes layouts de camino según el nivel
    const pathVariants = [
      // Nivel 1-2: Camino simple horizontal
      this.createStraightPath(),
      // Nivel 3-4: Camino con una curva
      this.createLShapePath(), 
      // Nivel 5-6: Camino en zigzag
      this.createZigzagPath(),
      // Nivel 7-8: Camino complejo con múltiples curvas
      this.createComplexPath(),
      // Nivel 9-10: Camino en espiral
      this.createSpiralPath()
    ];

    const variantIndex = Math.min(Math.floor((level - 1) / 2), pathVariants.length - 1);
    return pathVariants[variantIndex];
  }

  // Diferentes tipos de caminos
  private createStraightPath(): GridPosition[] {
    const points: GridPosition[] = [];
    const centerRow = 7;
    
    for (let col = 0; col < 20; col++) {
      points.push({ row: centerRow, col });
    }
    
    return points;
  }

  private createLShapePath(): GridPosition[] {
    const points: GridPosition[] = [];
    
    // Horizontal desde la izquierda
    for (let col = 0; col <= 10; col++) {
      points.push({ row: 7, col });
    }
    
    // Vertical hacia arriba
    for (let row = 6; row >= 3; row--) {
      points.push({ row, col: 10 });
    }
    
    // Horizontal hacia la derecha
    for (let col = 11; col < 20; col++) {
      points.push({ row: 3, col });
    }
    
    return points;
  }

  private createZigzagPath(): GridPosition[] {
    const points: GridPosition[] = [];
    
    // Primera línea horizontal
    for (let col = 0; col <= 8; col++) {
      points.push({ row: 9, col });
    }
    
    // Subir
    for (let row = 8; row >= 5; row--) {
      points.push({ row, col: 8 });
    }
    
    // Segunda línea horizontal 
    for (let col = 9; col <= 15; col++) {
      points.push({ row: 5, col });
    }
    
    // Bajar
    for (let row = 6; row <= 9; row++) {
      points.push({ row, col: 15 });
    }
    
    // Línea final
    for (let col = 16; col < 20; col++) {
      points.push({ row: 9, col });
    }
    
    return points;
  }

  private createComplexPath(): GridPosition[] {
    const points: GridPosition[] = [];
    
    // Entrada desde abajo
    for (let row = 12; row >= 8; row--) {
      points.push({ row, col: 2 });
    }
    
    // Horizontal hacia la derecha
    for (let col = 3; col <= 10; col++) {
      points.push({ row: 8, col });
    }
    
    // Subir
    for (let row = 7; row >= 4; row--) {
      points.push({ row, col: 10 });
    }
    
    // Horizontal izquierda
    for (let col = 9; col >= 5; col--) {
      points.push({ row: 4, col });
    }
    
    // Bajar un poco
    for (let row = 5; row <= 6; row++) {
      points.push({ row, col: 5 });
    }
    
    // Horizontal derecha hacia salida
    for (let col = 6; col < 20; col++) {
      points.push({ row: 6, col });
    }
    
    return points;
  }

  private createSpiralPath(): GridPosition[] {
    const points: GridPosition[] = [];
    
    // Entrada desde la esquina
    for (let row = 12; row >= 9; row--) {
      points.push({ row, col: 1 });
    }
    
    // Primera vuelta del espiral
    for (let col = 2; col <= 12; col++) {
      points.push({ row: 9, col });
    }
    
    for (let row = 8; row >= 3; row--) {
      points.push({ row, col: 12 });
    }
    
    for (let col = 11; col >= 4; col--) {
      points.push({ row: 3, col });
    }
    
    for (let row = 4; row <= 7; row++) {
      points.push({ row, col: 4 });
    }
    
    // Centro hacia salida
    for (let col = 5; col <= 8; col++) {
      points.push({ row: 7, col });
    }
    
    for (let row = 6; row >= 5; row--) {
      points.push({ row, col: 8 });
    }
    
    // Salida
    for (let col = 9; col < 20; col++) {
      points.push({ row: 5, col });
    }
    
    return points;
  }

  // Obtener posición en el camino basada en progreso (0-1)
  getPositionAtProgress(path: GamePath, progress: number): { 
    position: IsometricPosition; 
    gridPos: GridPosition;
    rotation: number; 
  } {
    // Clamp progress entre 0 y 1
    progress = Math.max(0, Math.min(1, progress));
    
    if (progress === 0) {
      return {
        position: path.spawnPoint.isoPos,
        gridPos: path.spawnPoint.gridPos,
        rotation: 0
      };
    }
    
    if (progress === 1) {
      return {
        position: path.basePoint.isoPos,
        gridPos: path.basePoint.gridPos,
        rotation: 0
      };
    }

    // Encontrar segmento del camino
    const totalPoints = path.points.length;
    const targetIndex = progress * (totalPoints - 1);
    const segmentIndex = Math.floor(targetIndex);
    const segmentProgress = targetIndex - segmentIndex;
    
    // Asegurar que no nos salimos del array
    const currentIndex = Math.min(segmentIndex, totalPoints - 2);
    const nextIndex = currentIndex + 1;
    
    const currentPoint = path.points[currentIndex];
    const nextPoint = path.points[nextIndex];
    
    // Interpolación lineal entre los dos puntos
    const interpolatedPos: IsometricPosition = {
      x: currentPoint.isoPos.x + (nextPoint.isoPos.x - currentPoint.isoPos.x) * segmentProgress,
      y: currentPoint.isoPos.y + (nextPoint.isoPos.y - currentPoint.isoPos.y) * segmentProgress,
      z: 0
    };
    
    // Calcular rotación basada en la dirección del movimiento
    const dx = nextPoint.isoPos.x - currentPoint.isoPos.x;
    const dy = nextPoint.isoPos.y - currentPoint.isoPos.y;
    const rotation = Math.atan2(dy, dx);
    
    // Grid position aproximada
    const gridPos = IsometricUtils.isoToGrid(interpolatedPos);
    
    return {
      position: interpolatedPos,
      gridPos,
      rotation
    };
  }

  // Obtener el camino para un nivel específico
  getPathForLevel(level: number): GamePath {
    return this.generateMainPath(level);
  }

  // Verificar si una posición está en el camino
  isPositionOnPath(gridPos: GridPosition, path: GamePath): boolean {
    return path.points.some(point => 
      point.gridPos.row === gridPos.row && point.gridPos.col === gridPos.col
    );
  }

  // Obtener todas las posiciones del camino como grid positions
  getPathGridPositions(path: GamePath): GridPosition[] {
    return path.points.map(point => point.gridPos);
  }

  // Calcular distancia desde una posición hasta el camino más cercano
  getDistanceToPath(gridPos: GridPosition, path: GamePath): number {
    let minDistance = Infinity;
    
    path.points.forEach(pathPoint => {
      const distance = Math.sqrt(
        Math.pow(gridPos.row - pathPoint.gridPos.row, 2) + 
        Math.pow(gridPos.col - pathPoint.gridPos.col, 2)
      );
      minDistance = Math.min(minDistance, distance);
    });
    
    return minDistance;
  }

  // Limpiar cache de caminos (útil para recargar niveles)
  clearPathCache(): void {
    this.paths.clear();
  }
}

// Clase para manejar el movimiento de una entidad a lo largo de un camino
export class PathFollower {
  private path: GamePath;
  private progress: number = 0;
  private speed: number;
  private currentPosition: IsometricPosition;
  private currentGridPos: GridPosition;
  private rotation: number = 0;
  
  constructor(path: GamePath, speed: number) {
    this.path = path;
    this.speed = speed;
    this.currentPosition = path.spawnPoint.isoPos;
    this.currentGridPos = path.spawnPoint.gridPos;
  }

  // Actualizar posición basada en delta time
  update(deltaTime: number): void {
    if (this.progress >= 1) return; // Ya llegó al final
    
    // Incrementar progreso basado en velocidad y tiempo
    const progressIncrement = (this.speed * deltaTime) / this.path.totalLength;
    this.progress = Math.min(1, this.progress + progressIncrement);
    
    // Obtener nueva posición
    const positionData = PathfindingSystem.getInstance().getPositionAtProgress(this.path, this.progress);
    this.currentPosition = positionData.position;
    this.currentGridPos = positionData.gridPos;
    this.rotation = positionData.rotation;
  }

  // Getters
  getCurrentPosition(): IsometricPosition {
    return this.currentPosition;
  }
  
  getCurrentGridPosition(): GridPosition {
    return this.currentGridPos;
  }
  
  getRotation(): number {
    return this.rotation;
  }
  
  getProgress(): number {
    return this.progress;
  }
  
  hasReachedEnd(): boolean {
    return this.progress >= 1;
  }
  
  // Establecer velocidad (útil para efectos de slow)
  setSpeed(newSpeed: number): void {
    this.speed = newSpeed;
  }
  
  getSpeed(): number {
    return this.speed;
  }
  
  // Resetear al inicio del camino
  reset(): void {
    this.progress = 0;
    this.currentPosition = this.path.spawnPoint.isoPos;
    this.currentGridPos = this.path.spawnPoint.gridPos;
    this.rotation = 0;
  }
}