import type { Pokemon, IPokemonService, Position, GameConfig } from '../types/interfaces';

interface PokemonData {
    id: string;
    name: string;
    types: string[];
    url: string;
    appearance: string | null;
    habitat: string | null;
    species: string | null;
}

export class PokemonService implements IPokemonService {
    private pokemonData: PokemonData[] = [];
    private dataLoaded: Promise<void>;
    public allPokemon: Pokemon[] = [];

    constructor(private config: GameConfig) {
        this.dataLoaded = this.loadPokemonData();
    }

    private async loadPokemonData(): Promise<void> {
        try {
            const response = await fetch('/pokemon_data.json');
            this.pokemonData = await response.json();
            console.log(`Loaded ${this.pokemonData.length} Pokemon from data file`);
            
            this.allPokemon = this.pokemonData.map((data) => {
                const imagePath = this.getImagePath(parseInt(data.id), data);
                return {
                    id: parseInt(data.id),
                    pokemon_id: data.id,
                    name: data.name,
                    types: data.types,
                    image: imagePath,
                    url: data.url,
                    appearance: data.appearance,
                    habitat: data.habitat,
                    species: data.species,
                    x: 0,
                    y: 0,
                    size: this.config.POKEMON_SIZE,
                    image_url: '',
                    local_image: imagePath
                };
            });
        } catch (error) {
            console.error('Failed to load Pokemon data:', error);
            this.pokemonData = [];
        }
    }

    getAllPokemon(): Pokemon[] {
        return this.allPokemon;
    }

    async generatePokemon(position: Position, terrainType: string | null = null): Promise<Pokemon> {
        await this.dataLoaded;
        
        if (this.pokemonData.length === 0) {
            throw new Error('Failed to load Pokemon data');
        }

        let eligiblePokemon = this.pokemonData;
        
        if (terrainType === 'water') {
            eligiblePokemon = this.pokemonData.filter(pokemon => 
                pokemon.types.includes('Wasser') ||
                pokemon.types.includes('Water')
            );

            console.log('Water terrain detected:', {
                position,
                eligiblePokemonCount: eligiblePokemon.length,
                eligiblePokemon: eligiblePokemon.map(p => ({
                    name: p.name,
                    types: p.types
                }))
            });

            if (eligiblePokemon.length === 0) {
                console.warn('No water Pokemon available, position needs to be adjusted');
                throw new Error('No eligible Pokemon for water terrain');
            }
        }

        const randomIndex = Math.floor(Math.random() * eligiblePokemon.length);
        const pokemonData = eligiblePokemon[randomIndex];
        
        const imagePath = this.getImagePath(parseInt(pokemonData.id), pokemonData);
        
        console.log('Generated Pokemon:', {
            name: pokemonData.name,
            types: pokemonData.types,
            terrainType,
            position
        });

        return {
            id: parseInt(pokemonData.id),
            pokemon_id: pokemonData.id,
            name: pokemonData.name,
            types: pokemonData.types,
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE,
            image: imagePath,
            url: pokemonData.url,
            appearance: pokemonData.appearance,
            habitat: pokemonData.habitat,
            species: pokemonData.species,
            image_url: '',
            local_image: imagePath
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