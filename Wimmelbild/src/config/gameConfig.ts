import type { GameConfig } from '../types/interfaces';

function calculatePokemonCount(): number {
    // Base count for mobile screens
    const BASE_COUNT = 20;
    // Additional count for larger screens
    const LARGE_SCREEN_COUNT = 50;
    // Threshold for "large" screen (typical mobile width)
    const LARGE_SCREEN_WIDTH = 768;

    return window.innerWidth > LARGE_SCREEN_WIDTH ? LARGE_SCREEN_COUNT : BASE_COUNT;
}

export const gameConfig: GameConfig = {
    get POKEMON_COUNT() {
        return calculatePokemonCount();
    },
    POKEMON_SIZE: 60,
    SCREEN_PADDING: 20,
    OVERLAP_THRESHOLD: 0.7,
    TARGET_PANEL_WIDTH: 200,
    TARGET_PANEL_HEIGHT: 300,
    MAX_POKEMON_ID: 1023
}; 