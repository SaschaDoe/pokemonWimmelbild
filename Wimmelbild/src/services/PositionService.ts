import type { Position, Pokemon } from '../types/interfaces';
import type { GameConfig } from '../types/interfaces';

export class PositionService {
    private readonly PROGRESS_BAR_AREA = {
        top: 20,
        height: 80, // Increased to account for the progress bar and text
        left: window.innerWidth / 2 - 120, // 200px width + some padding
        width: 240 // 200px width + some padding
    };

    constructor(private config: GameConfig) {}

    private isPositionInProgressBar(x: number, y: number, size: number): boolean {
        return (
            y < (this.PROGRESS_BAR_AREA.top + this.PROGRESS_BAR_AREA.height) &&
            x > this.PROGRESS_BAR_AREA.left - size &&
            x < (this.PROGRESS_BAR_AREA.left + this.PROGRESS_BAR_AREA.width)
        );
    }

    public getRandomPosition(size: number): Position {
        const padding = size + 20; // Add some padding around the edges
        let x: number;
        let y: number;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.random() * (window.innerWidth - size - padding * 2) + padding;
            y = Math.random() * (window.innerHeight - size - padding * 2) + padding;
            attempts++;

            // Break the loop if we've tried too many times
            if (attempts > maxAttempts) {
                console.warn('Max position attempts reached, using last generated position');
                break;
            }
        } while (
            this.isPositionInProgressBar(x, y, size) || // Check progress bar area
            y < 100 || // Keep away from top of screen
            x > (window.innerWidth - 220) || // Keep away from right edge (target panel)
            x < 100 // Keep away from left edge (pokedex button)
        );

        return { x, y };
    }

    public checkOverlap(x: number, y: number, size: number, existingItems: Pokemon[]): boolean {
        // First check if position overlaps with the progress bar
        if (this.isPositionInProgressBar(x, y, size)) {
            return true;
        }

        // Then check overlap with existing items
        return existingItems.some(item => {
            const distance = Math.sqrt(
                Math.pow(x - item.x, 2) + 
                Math.pow(y - item.y, 2)
            );
            return distance < (size + item.size) / 2;
        });
    }
} 