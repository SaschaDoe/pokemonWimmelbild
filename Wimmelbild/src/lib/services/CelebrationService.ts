export class CelebrationService {
    private celebrationPokemonId: number | null = null;

    setCelebrationPokemon(pokemonId: number): void {
        this.celebrationPokemonId = pokemonId;
    }

    getCelebrationPokemon(): number | null {
        return this.celebrationPokemonId;
    }
} 