import type { Pokemon, Berry } from '../types/interfaces';

export class GameStateManager {
    private discoveredPokemon: Set<number>;

    constructor() {
        this.discoveredPokemon = new Set(
            JSON.parse(localStorage.getItem('discoveredPokemon') || '[]')
        );
    }

    addDiscoveredPokemon(pokemonId: number): void {
        this.discoveredPokemon.add(pokemonId);
        this.saveDiscoveredPokemon();
    }

    getDiscoveredPokemon(): Set<number> {
        return this.discoveredPokemon;
    }

    resetProgress(): void {
        this.discoveredPokemon = new Set();
        this.saveDiscoveredPokemon();
    }

    private saveDiscoveredPokemon(): void {
        localStorage.setItem('discoveredPokemon', 
            JSON.stringify([...this.discoveredPokemon])
        );
    }

    checkWinCondition(foundItems: (Pokemon | Berry)[], targetPokemon: Pokemon, targetBerries: Berry[]): boolean {
        const allBerriesFound = targetBerries.every(targetBerry => 
            foundItems.some(item => !('id' in item) && item.index === targetBerry.index)
        );
        
        const targetPokemonFound = foundItems.some(item => 
            'id' in item && item.id === targetPokemon.id
        );

        return allBerriesFound && targetPokemonFound;
    }
} 