export interface Pokemon {
    id: number;
    x: number;
    y: number;
    size: number;
    image: string;
}

export interface GameConfig {
    POKEMON_COUNT: number;
    POKEMON_SIZE: number;
    SCREEN_PADDING: number;
    OVERLAP_THRESHOLD: number;
    TARGET_PANEL_WIDTH: number;
    TARGET_PANEL_HEIGHT: number;
    MAX_POKEMON_ID: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface IPositionService {
    getRandomPosition(size: number): Position;
    checkOverlap(newX: number, newY: number, newSize: number, existingPokemons: Pokemon[]): boolean;
}

export interface IPokemonService {
    generatePokemon(position: Position): Pokemon;
    getImagePath(id: number): string;
} 