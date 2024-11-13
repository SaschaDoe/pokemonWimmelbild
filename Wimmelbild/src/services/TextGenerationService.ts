export class TextGenerationService {
    private extractSentences(text: string | null, maxSentences: number | null = null): string[] {
        if (!text) return [];
        
        // Split text into sentences (considering . ! ? as sentence endings)
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        // If maxSentences is null, return all sentences, otherwise limit them
        return maxSentences ? sentences.slice(0, maxSentences) : sentences;
    }

    private getTypesText(types: string[], name: string): string {
        if (types.length === 0) return '';
        
        if (types.length === 1) {
            return `${name} ist vom Typ ${types[0]}. `;
        }
        
        const lastType = types[types.length - 1];
        const otherTypes = types.slice(0, -1);
        return `${name} ist vom Typ ${otherTypes.join(', ')} und ${lastType}. `;
    }

    private getEvolutionText(evolution: string | null): string {
        if (!evolution) return '';
        return `${evolution}. `;
    }

    public generatePokemonDescription(pokemon: {
        name: string;
        appearance: string | null;
        habitat: string | null;
        species: string | null;
        types: string[];
        evolution: string | null;
    }): string {
        let description = `${pokemon.name}. `;

        // Add types description
        description += this.getTypesText(pokemon.types, pokemon.name);

        // Add evolution information
        description += this.getEvolutionText(pokemon.evolution);

        // If both appearance and habitat exist
        if (pokemon.appearance && pokemon.habitat) {
            // Take first 3 sentences from appearance
            const appearanceSentences = this.extractSentences(pokemon.appearance, 3);
            description += `${appearanceSentences.join(' ')} `;

            // Take all sentences from habitat
            const habitatSentences = this.extractSentences(pokemon.habitat);
            description += `Lebensraum von ${pokemon.name}. ${habitatSentences.join(' ')} `;
        }
        // If only appearance exists
        else if (pokemon.appearance) {
            const appearanceSentences = this.extractSentences(pokemon.appearance, 3);
            description += `${appearanceSentences.join(' ')} `;
        }
        // If only habitat exists
        else if (pokemon.habitat) {
            const habitatSentences = this.extractSentences(pokemon.habitat);
            description += `Lebensraum von ${pokemon.name}. ${habitatSentences.join(' ')} `;
        }

        if (pokemon.species) {
            description += pokemon.species;
        }

        return description.trim();
    }
} 