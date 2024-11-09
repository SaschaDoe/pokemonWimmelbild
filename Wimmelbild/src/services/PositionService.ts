import type { Position, IPositionService, Pokemon, GameConfig } from '../types/interfaces';

export class PositionService implements IPositionService {
    constructor(private config: GameConfig) {}

    getRandomPosition(size: number): Position {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let x = this.config.SCREEN_PADDING + 
            Math.random() * (viewportWidth - size - this.config.SCREEN_PADDING * 2);
        let y = this.config.SCREEN_PADDING + 
            Math.random() * (viewportHeight - size - this.config.SCREEN_PADDING * 2);
        
        if (x < this.config.TARGET_PANEL_WIDTH && y < this.config.TARGET_PANEL_HEIGHT) {
            if (Math.random() > 0.5) {
                y = this.config.TARGET_PANEL_HEIGHT + this.config.SCREEN_PADDING;
            } else {
                x = this.config.TARGET_PANEL_WIDTH + this.config.SCREEN_PADDING;
            }
        }
        
        return { x, y };
    }

    checkOverlap(newX: number, newY: number, newSize: number, existingPokemons: Pokemon[]): boolean {
        return existingPokemons.some(pokemon => {
            const dx = newX - pokemon.x;
            const dy = newY - pokemon.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (newSize + pokemon.size) / 2 + this.config.OVERLAP_THRESHOLD;
        });
    }
} 