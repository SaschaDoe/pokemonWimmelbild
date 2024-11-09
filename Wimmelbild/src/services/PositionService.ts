import type { Pokemon, IPositionService, Position, GameConfig } from '../types/interfaces';

export class PositionService implements IPositionService {
    constructor(private config: GameConfig) {}

    getRandomPosition(size: number): Position {
        const maxX = window.innerWidth - size - this.config.SCREEN_PADDING;
        const maxY = window.innerHeight - size - this.config.SCREEN_PADDING;
        
        return {
            x: Math.random() * maxX + this.config.SCREEN_PADDING,
            y: Math.random() * maxY + this.config.SCREEN_PADDING
        };
    }

    checkOverlap(newX: number, newY: number, newSize: number, existingPokemons: Pokemon[]): boolean {
        // Check overlap with target display area (top-right corner)
        const targetDisplayOverlap = this.checkTargetDisplayOverlap(newX, newY, newSize);
        if (targetDisplayOverlap) {
            return true;
        }

        // Check overlap with existing Pokemon
        return existingPokemons.some(pokemon => {
            const distance = Math.sqrt(
                Math.pow(newX - pokemon.x, 2) + Math.pow(newY - pokemon.y, 2)
            );
            return distance < (newSize + pokemon.size) * this.config.OVERLAP_THRESHOLD;
        });
    }

    private checkTargetDisplayOverlap(x: number, y: number, size: number): boolean {
        // Target display is positioned in the top-right corner
        const targetArea = {
            x: window.innerWidth - this.config.TARGET_PANEL_WIDTH - 20, // 20px margin
            y: 20, // From the top
            width: this.config.TARGET_PANEL_WIDTH,
            height: this.config.TARGET_PANEL_HEIGHT
        };

        // Check if the Pokemon overlaps with the target display area
        return !(x + size < targetArea.x || // Pokemon is left of target area
                x > targetArea.x + targetArea.width || // Pokemon is right of target area
                y + size < targetArea.y || // Pokemon is above target area
                y > targetArea.y + targetArea.height); // Pokemon is below target area
    }
} 