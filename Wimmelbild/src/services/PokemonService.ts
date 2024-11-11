import type { Pokemon, IPokemonService, Position, GameConfig } from '../types/interfaces';
import { ImageService } from './ImageService';

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
    private _dataLoaded: Promise<void>;
    public allPokemon: Pokemon[] = [];
    private imageService: ImageService;

    constructor(private config: GameConfig) {
        this.imageService = new ImageService();
        this._dataLoaded = this.loadPokemonData();
    }

    get dataLoaded(): Promise<void> {
        return this._dataLoaded;
    }

    private async loadPokemonData(): Promise<void> {
        try {
            const response = await fetch('/pokemon_data.json');
            this.pokemonData = await response.json();
            console.log(`Loaded ${this.pokemonData.length} Pokemon from data file`);
            
            this.allPokemon = this.pokemonData.map((data) => {
                const imagePath = this.imageService.getPokemonImagePath(parseInt(data.id), data);
                return this.createPokemonObject(data, { x: 0, y: 0 }, imagePath);
            });
        } catch (error) {
            console.error('Failed to load Pokemon data:', error);
            this.pokemonData = [];
        }
    }

    private createPokemonObject(data: PokemonData, position: Position, imagePath: string): Pokemon {
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
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE,
            image_url: '',
            local_image: imagePath
        };
    }

    getAllPokemon(): Pokemon[] {
        return this.allPokemon;
    }

    async generatePokemon(position: Position, terrainTypes: string[] | null = null): Promise<Pokemon> {
        await this.dataLoaded;
        
        if (this.pokemonData.length === 0) {
            throw new Error('Failed to load Pokemon data');
        }

        let eligiblePokemon = this.pokemonData;
        
        if (terrainTypes) {
            eligiblePokemon = this.pokemonData.filter(pokemon => 
                pokemon.types.some(type => terrainTypes.includes(type))
            );

            console.log('Terrain-specific Pokemon selection:', {
                position,
                terrainTypes,
                eligiblePokemonCount: eligiblePokemon.length,
                eligiblePokemon: eligiblePokemon.map(p => ({
                    name: p.name,
                    types: p.types
                }))
            });

            if (eligiblePokemon.length === 0) {
                console.warn('No eligible Pokemon for terrain types, position needs to be adjusted');
                throw new Error(`No eligible Pokemon for terrain types: ${terrainTypes.join(', ')}`);
            }
        }

        const randomIndex = Math.floor(Math.random() * eligiblePokemon.length);
        const pokemonData = eligiblePokemon[randomIndex];
        
        const imagePath = this.imageService.getPokemonImagePath(parseInt(pokemonData.id), pokemonData);
        
        console.log('Generated Pokemon:', {
            name: pokemonData.name,
            types: pokemonData.types,
            terrainTypes,
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
} 