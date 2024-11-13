import { ConfigService } from '../config/ConfigService';
import type { Pokemon, IPokemonService, Position, GameConfig } from '../types/interfaces';
import { ImageService } from './ImageService';
import { WeatherService } from './WeatherService';

interface PokemonData {
    id: string;
    name: string;
    types: string[];
    url: string;
    appearance: string | null;
    habitat: string | null;
    species: string | null;
    evolution: string | null;
}

interface GameMode {
    isScaryNight: boolean;
}

export class PokemonService implements IPokemonService {
    private pokemonData: PokemonData[] = [];
    private _dataLoaded: Promise<void>;
    public allPokemon: Pokemon[] = [];
    private imageService: ImageService;
    private gameMode: GameMode = { isScaryNight: false };
    private weatherService: WeatherService;
    private configService: ConfigService;
    private pokemonByType: Map<string, Pokemon[]> = new Map();

    constructor(private config: GameConfig) {
        this.imageService = new ImageService();
        this.weatherService = new WeatherService();
        this.configService = ConfigService.getInstance();
        this._dataLoaded = this.loadPokemonData();
    }

    get dataLoaded(): Promise<void> {
        return this._dataLoaded;
    }

    private addPokemonToTypeMap(pokemon: Pokemon) {
        pokemon.types.forEach(type => {
            if (!this.pokemonByType.has(type)) {
                this.pokemonByType.set(type, []);
            }
            this.pokemonByType.get(type)!.push(pokemon);
        });
    }

    private async loadPokemonData(): Promise<void> {
        try {
            const response = await fetch('/pokemon_data.json');
            this.pokemonData = await response.json();
            
            this.allPokemon = this.pokemonData.map((data) => {
                const imagePath = this.imageService.getPokemonImagePath(parseInt(data.id), data);
                const pokemon = this.createPokemonObject(data, { x: 0, y: 0 }, imagePath);
                this.addPokemonToTypeMap(pokemon);
                return pokemon;
            });

            console.log('Pokemon loaded:', {
                total: this.allPokemon.length,
                typeDistribution: Array.from(this.pokemonByType.entries()).map(([type, pokemons]) => ({
                    type,
                    count: pokemons.length
                }))
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
            evolution: data.evolution,
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE,
            image_url: '',
            local_image: imagePath
        };
    }

    public initializeGameMode(backgroundPath: string) {
        this.gameMode.isScaryNight = this.shouldActivateScaryMode(backgroundPath);
        if (this.gameMode.isScaryNight) {
            console.log('Activating scary night mode! 👻');
            this.weatherService.start();
            this.addDarkOverlay();
        }
    }

    private shouldActivateScaryMode(backgroundPath: string): boolean {
        if (backgroundPath.toLowerCase().includes('underwater')) {
            return false;
        }
        return Math.random() < 0.05;
    }

    private addDarkOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'scary-mode-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 20, 0.5)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '0';
        document.body.appendChild(overlay);
    }

    async generatePokemon(position: Position, terrainTypes: string[] | null = null): Promise<Pokemon> {
        await this.dataLoaded;
        
        if (this.pokemonData.length === 0) {
            throw new Error('Failed to load Pokemon data');
        }

        let eligiblePokemon: Pokemon[] = [];
        
        if (this.gameMode.isScaryNight) {
            // In scary mode, only use psychic/ghost/dark types
            const scaryTypes = ['Psycho', 'Geist', 'Unlicht'];
            scaryTypes.forEach(type => {
                const typePokemons = this.pokemonByType.get(type) || [];
                eligiblePokemon.push(...typePokemons);
            });
            eligiblePokemon = [...new Set(eligiblePokemon)]; // Remove duplicates
        } else if (terrainTypes) {
            // Use type map for terrain-based selection
            terrainTypes.forEach(type => {
                const typePokemons = this.pokemonByType.get(type) || [];
                eligiblePokemon.push(...typePokemons);
            });
            eligiblePokemon = [...new Set(eligiblePokemon)]; // Remove duplicates
        }

        // Fallback to all Pokemon if no eligible ones found
        if (eligiblePokemon.length === 0) {
            eligiblePokemon = this.allPokemon;
        }

        const randomIndex = Math.floor(Math.random() * eligiblePokemon.length);
        const selectedPokemon = eligiblePokemon[randomIndex];
        
        return {
            ...selectedPokemon,
            x: position.x,
            y: position.y,
            size: this.config.POKEMON_SIZE
        };
    }

    public endScaryMode() {
        if (this.gameMode.isScaryNight) {
            this.gameMode.isScaryNight = false;
            this.weatherService.stop();
            const overlay = document.getElementById('scary-mode-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    public cleanup() {
        this.endScaryMode();
    }

    public getAllPokemon(): Pokemon[] {
        return this.allPokemon;
    }

    public getImagePath(id: number): string {
        return this.imageService.getPokemonImagePath(id, this.pokemonData.find(p => parseInt(p.id) === id));
    }
} 