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

    constructor(private config: GameConfig) {
        this.imageService = new ImageService();
        this.weatherService = new WeatherService();
        this._dataLoaded = this.loadPokemonData();
    }

    private shouldActivateScaryMode(backgroundPath: string): boolean {
        // Don't activate scary mode for underwater backgrounds
        if (backgroundPath.toLowerCase().includes('underwater')) {
            return false;
        }
        // 5% chance for other backgrounds
        return Math.random() < 0.05;
    }

    public initializeGameMode(backgroundPath: string) {
        this.gameMode.isScaryNight = this.shouldActivateScaryMode(backgroundPath);
        if (this.gameMode.isScaryNight) {
            console.log('Activating scary night mode! 👻');
            this.weatherService.start();
            this.addDarkOverlay();
        }
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
            evolution: data.evolution,
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
        
        if (this.gameMode.isScaryNight) {
            eligiblePokemon = this.pokemonData.filter(pokemon => 
                pokemon.types.some(type => ['Psycho', 'Geist', 'Unlicht'].includes(type))
            );
        } else if (terrainTypes) {
            eligiblePokemon = this.pokemonData.filter(pokemon => 
                pokemon.types.some(type => terrainTypes.includes(type))
            );
        }

        if (eligiblePokemon.length === 0) {
            console.warn('No eligible Pokemon found, falling back to any Pokemon');
            eligiblePokemon = this.pokemonData;
        }

        const randomIndex = Math.floor(Math.random() * eligiblePokemon.length);
        const pokemonData = eligiblePokemon[randomIndex];
        
        const imagePath = this.imageService.getPokemonImagePath(parseInt(pokemonData.id), pokemonData);
        
        return this.createPokemonObject(pokemonData, position, imagePath);
    }

    public cleanup() {
        this.endScaryMode();
    }
} 