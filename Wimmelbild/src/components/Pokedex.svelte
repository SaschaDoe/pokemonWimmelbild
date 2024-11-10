<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    
    export let pokemon: Pokemon;

    // Function to normalize type names
    function normalizeTypeName(type: string): string {
        // Convert to lowercase and remove any spaces or special characters
        return type.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/-/g, '')
            .trim();
    }
</script>

<div class="pokedex">
    <div class="pokemon-image">
        <img src={pokemon.local_image || pokemon.image} alt={pokemon.name} />
    </div>
    <div class="pokemon-info">
        <h3>{pokemon.name}</h3>
        <p class="pokemon-id">#{pokemon.pokemon_id || pokemon.id.toString().padStart(4, '0')}</p>
        <div class="types">
            {#each pokemon.types as type}
                <span class="type {normalizeTypeName(type)}">{type}</span>
            {/each}
        </div>
    </div>
</div>

<style>
    .pokedex {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pokemon-image {
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pokemon-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .pokemon-info {
        flex: 1;
        text-align: left;
    }

    h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.5rem;
    }

    .pokemon-id {
        color: #666;
        margin: 0 0 0.5rem 0;
        font-family: monospace;
    }

    .types {
        display: flex;
        gap: 0.5rem;
    }

    .type {
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.875rem;
        color: white;
        text-transform: capitalize;
    }

    /* Type colors */
    .normal { background-color: #A8A878; }
    .fire { background-color: #F08030; }
    .water { background-color: #6890F0; }
    .electric { background-color: #F8D030; }
    .grass { background-color: #78C850; }
    .ice { background-color: #98D8D8; }
    .fighting { background-color: #C03028; }
    .poison { background-color: #A040A0; }
    .ground { background-color: #E0C068; }
    .flying { background-color: #A890F0; }
    .psychic { background-color: #F85888; }
    .bug { background-color: #A8B820; }
    .rock { background-color: #B8A038; }
    .ghost { background-color: #705898; }
    .dragon { background-color: #7038F8; }
    .dark { background-color: #705848; }
    .steel { background-color: #B8B8D0; }
    .fairy { background-color: #EE99AC; }

    /* Updated type colors with all possible variations */
    .feuer { background-color: #F08030; }
    .wasser { background-color: #6890F0; }
    .pflanze { background-color: #78C850; }
    .elektro { background-color: #F8D030; }
    .eis { background-color: #98D8D8; }
    .kampf { background-color: #C03028; }
    .gift { background-color: #A040A0; }
    .boden { background-color: #E0C068; }
    .flug { background-color: #A890F0; }
    .psycho { background-color: #F85888; }
    .kaefer { background-color: #A8B820; }
    .gestein { background-color: #B8A038; }
    .geist { background-color: #705898; }
    .drache { background-color: #7038F8; }
    .unlicht { background-color: #705848; }
    .stahl { background-color: #B8B8D0; }
    .fee { background-color: #EE99AC; }
</style> 