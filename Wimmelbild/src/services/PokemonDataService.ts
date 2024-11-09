interface PokemonData {
    name: string;
    types: string[];
}

export class PokemonDataService {
    private pokemonData: Map<number, PokemonData> = new Map([
        [673, { name: "Adebom", types: ["Flug", "Unlicht"] }],
        [676, { name: "Friseur", types: ["Fee"] }],
        [677, { name: "Psiau", types: ["Psycho"] }],
        [678, { name: "Psiaugon", types: ["Psycho"] }],
        // Add more Pokemon data here as needed
    ]);

    getPokemonData(id: number): PokemonData {
        const data = this.pokemonData.get(id);
        if (!data) {
            // Return a default Pokemon if ID is not found
            return {
                name: `Pokemon ${id}`,
                types: ["Normal"]
            };
        }
        return data;
    }

    getAvailableIds(): number[] {
        return Array.from(this.pokemonData.keys());
    }
} 