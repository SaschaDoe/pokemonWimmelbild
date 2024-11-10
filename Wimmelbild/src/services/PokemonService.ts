import type { Pokemon, IPokemonService, Position, GameConfig } from '../types/interfaces';

interface PokemonData {
    id: string;
    name: string;
    types: string[];
    url: string;
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
            console.log(`Loaded ${this.pokemonData.length} Pokemon from data file`);
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
        
        const imagePath = this.getImagePath(parseInt(pokemonData.id), pokemonData);
        
        console.log(`Generating Pokemon: ${pokemonData.name} (ID: ${pokemonData.id})`, {
            name: pokemonData.name,
            id: pokemonData.id,
            types: pokemonData.types,
            imagePath
        });
        
        this.testImageExists(imagePath, pokemonData);
        
        return {
            id: parseInt(pokemonData.id),
            name: pokemonData.name,
            types: pokemonData.types,
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE,
            image: imagePath,
            url: pokemonData.url
        };
    }

    private async testImageExists(imagePath: string, pokemonData: PokemonData): Promise<void> {
        try {
            const response = await fetch(imagePath);
            if (!response.ok) {
                console.error(`Failed to load image for Pokemon:`, {
                    name: pokemonData.name,
                    id: pokemonData.id,
                    types: pokemonData.types,
                    path: imagePath,
                    status: response.status,
                    statusText: response.statusText
                });
            }
        } catch (error) {
            console.error(`Error testing image existence for Pokemon:`, {
                name: pokemonData.name,
                id: pokemonData.id,
                types: pokemonData.types,
                path: imagePath,
                error
            });
        }
    }

    getImagePath(id: number, pokemonData?: PokemonData): string {
        if (!pokemonData) {
            pokemonData = this.pokemonData.find(p => parseInt(p.id) === id);
            if (!pokemonData) {
                throw new Error(`No data found for Pokemon ID ${id}`);
            }
        }

        try {
            const idStr = id.toString();
            const paddedId = idStr.length >= 4 ? idStr : idStr.padStart(4, '0');
            const nameWithId = `${paddedId}${pokemonData.name}`;
            
            let filename: string;
            if (pokemonData.types.length === 0) {
                filename = nameWithId;
            } else {
                filename = `${nameWithId}-${pokemonData.types.join('-')}`;
            }
            
            const path = `/pokemon_images/${filename}.png`;
            
            console.log(`Constructed image path for ${pokemonData.name}:`, {
                id: paddedId,
                name: pokemonData.name,
                types: pokemonData.types,
                path
            });
            
            return path;
        } catch (error) {
            console.error(`Error creating image path for Pokemon ${id}:`, {
                error,
                pokemonData
            });
            return '/pokemon_images/missing.png';
        }
    }
} 