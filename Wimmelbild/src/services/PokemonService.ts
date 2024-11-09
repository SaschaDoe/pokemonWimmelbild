import type { Pokemon, IPokemonService, Position, GameConfig } from '../types/interfaces';

export class PokemonService implements IPokemonService {
    constructor(private config: GameConfig) {}

    generatePokemon(position: Position): Pokemon {
        const id = Math.floor(Math.random() * this.config.MAX_POKEMON_ID) + 1;
        
        return {
            id,
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE,
            image: this.getImagePath(id)
        };
    }

    getImagePath(id: number): string {
        return `/pokemon_images/Icon_${String(id).padStart(3, '0')}.png`;
    }
} 