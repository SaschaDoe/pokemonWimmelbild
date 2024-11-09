import type { Pokemon, IPokemonService, Position, GameConfig } from '../types/interfaces';

interface PokemonData {
    id: string;
    name: string;
    types: string[];
}

export class PokemonService implements IPokemonService {
    private pokemonData: PokemonData[] = [];
    private dataLoaded: Promise<void>;

    constructor(private config: GameConfig) {
        this.dataLoaded = this.loadPokemonData();
    }

    private async loadPokemonData(): Promise<void> {
        try {
            const response = await fetch('/pokemon_data.json');
            this.pokemonData = await response.json();
        } catch (error) {
            console.error('Failed to load Pokemon data:', error);
            this.pokemonData = [];
        }
    }

    async generatePokemon(position: Position): Promise<Pokemon> {
        await this.dataLoaded;
        
        if (this.pokemonData.length === 0) {
            throw new Error('Failed to load Pokemon data');
        }

        const randomIndex = Math.floor(Math.random() * this.pokemonData.length);
        const pokemonData = this.pokemonData[randomIndex];
        
        return {
            id: parseInt(pokemonData.id),
            name: pokemonData.name,
            types: pokemonData.types,
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE,
            image: this.getImagePath(parseInt(pokemonData.id), pokemonData)
        };
    }

    getImagePath(id: number, pokemonData?: PokemonData): string {
        if (!pokemonData) {
            pokemonData = this.pokemonData.find(p => parseInt(p.id) === id);
            if (!pokemonData) {
                throw new Error(`No data found for Pokemon ID ${id}`);
            }
        }

        try {
            // For IDs like 1023, we don't need padding
            // For IDs like 5, we need padding to 0005
            const idStr = id.toString();
            const paddedId = idStr.length >= 4 ? idStr : idStr.padStart(4, '0');
            const nameWithId = `${paddedId}${pokemonData.name}`;
            
            // If there are no types, just use the name
            if (pokemonData.types.length === 0) {
                return `/pokemon_images/${nameWithId}.png`;
            }
            
            // Join name and types with hyphens
            const filename = `${nameWithId}-${pokemonData.types.join('-')}`;
            
            return `/pokemon_images/${filename}.png`;
        } catch (error) {
            console.error(`Error creating image path for Pokemon ${id}:`, error);
            return '/pokemon_images/missing.png'; // Fallback image
        }
    }
} 