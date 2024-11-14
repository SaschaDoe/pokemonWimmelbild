import type { Position, Pokemon } from '../types/interfaces';
import type { GameConfig } from '../types/interfaces';

export class PositionService {
    private readonly PROGRESS_BARS = {
        background: {
            top: 20,
            height: 80,
            left: window.innerWidth / 2 - 120, // Left progress bar
            width: 240
        },
        badge: {
            top: 20,
            height: 80,
            left: window.innerWidth / 2 + 120, // Right progress bar
            width: 240
        }
    };

    constructor(private config: GameConfig) {}

    private isPositionInProgressBar(x: number, y: number, size: number): boolean {
        const isInBackgroundBar = (
            y < (this.PROGRESS_BARS.background.top + this.PROGRESS_BARS.background.height) &&
            x > this.PROGRESS_BARS.background.left - size &&
            x < (this.PROGRESS_BARS.background.left + this.PROGRESS_BARS.background.width)
        );

        const isInBadgeBar = (
            y < (this.PROGRESS_BARS.badge.top + this.PROGRESS_BARS.badge.height) &&
            x > this.PROGRESS_BARS.badge.left - size &&
            x < (this.PROGRESS_BARS.badge.left + this.PROGRESS_BARS.badge.width)
        );

        return isInBackgroundBar || isInBadgeBar;
    }

    public getRandomPosition(size: number): Position {
        const padding = size + 20;
        let x: number;
        let y: number;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.random() * (window.innerWidth - size - padding) + padding;
            y = Math.random() * (window.innerHeight - size);
            attempts++;

            if (attempts > maxAttempts) {
                console.warn('Max position attempts reached, using last generated position');
                break;
            }
        } while (
            this.isPositionInProgressBar(x, y, size) || // Check both progress bar areas
            y < 100 || // Keep away from top of screen
            x > (window.innerWidth - 220) || // Keep away from right edge (target panel)
            x < 100 // Keep away from left edge (pokedex button)
        );

        return { x, y };
    }

    public checkOverlap(x: number, y: number, size: number, existingItems: Pokemon[]): boolean {
        // First check if position overlaps with either progress bar
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