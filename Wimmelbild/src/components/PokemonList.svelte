<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import PokemonDetails from './PokemonDetails.svelte';

    export let discoveredPokemon: Set<number>;
    export let allPokemon: Pokemon[];
    export let onClose: () => void;
    export let resetProgress: () => void;

    let selectedPokemon: Pokemon | null = null;

    // Sort Pokemon by ID
    $: sortedPokemon = [...allPokemon].sort((a, b) => a.id - b.id);

    function handlePokemonClick(pokemon: Pokemon) {
        if (discoveredPokemon.has(pokemon.id)) {
            selectedPokemon = pokemon;
        }
    }

    function closeDetails() {
        selectedPokemon = null;
    }
</script>

<div class="pokemon-list-overlay" on:click|self={onClose}>
    <div class="pokemon-list-content">
        <button class="close-button" on:click={onClose}>×</button>
        <h2>Pokédex ({discoveredPokemon.size}/{allPokemon.length})</h2>
        <div class="pokemon-grid">
            {#each sortedPokemon as pokemon (pokemon.id)}
                <button 
                    class="pokemon-item"
                    class:undiscovered={!discoveredPokemon.has(pokemon.id)}
                    on:click={() => handlePokemonClick(pokemon)}
                >
                    <div class="pokemon-number">#{pokemon.id.toString().padStart(4, '0')}</div>
                    {#if discoveredPokemon.has(pokemon.id)}
                        <img src={pokemon.image} alt={pokemon.name} />
                        <span class="pokemon-name">{pokemon.name}</span>
                    {:else}
                        <div class="undiscovered">
                            <img 
                                src={pokemon.image} 
                                alt="Unknown Pokemon" 
                                class="silhouette"
                            />
                            <span class="pokemon-name">???</span>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="reset-button-container">
            <button 
                class="reset-button"
                on:click={() => {
                    if (confirm('Are you sure you want to reset your Pokédex progress?')) {
                        resetProgress();
                    }
                }}
            >
                🔄 Reset Progress
            </button>
        </div>
    </div>
</div>

{#if selectedPokemon}
    <div class="pokemon-details-wrapper">
        <PokemonDetails pokemon={selectedPokemon} onClose={closeDetails} />
    </div>
{/if}

<style>
    .pokemon-list-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1800;
    }

    .pokemon-list-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        position: relative;
        width: 80%;
        height: 80%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 5px 10px;
        border-radius: 50%;
    }

    .close-button:hover {
        background: #f0f0f0;
    }

    .pokemon-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .pokemon-item {
        background: none;
        border: 2px solid #eee;
        border-radius: 8px;
        padding: 0.5rem;
        cursor: pointer;
        transition: transform 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative;
    }

    .pokemon-item:hover {
        transform: scale(1.05);
        border-color: #4CAF50;
    }

    .pokemon-item img {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }

    .pokemon-name {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        text-align: center;
    }

    .undiscovered {
        opacity: 0.7;
        cursor: default;
    }

    .silhouette {
        filter: brightness(0);
    }

    h2 {
        text-align: center;
        color: #333;
        margin-bottom: 1rem;
    }

    .pokemon-number {
        position: absolute;
        top: 5px;
        left: 5px;
        font-size: 0.8rem;
        color: #666;
    }

    .pokemon-details-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
    }

    .reset-button-container {
        display: flex;
        justify-content: center;
        padding: 1rem;
        margin-top: auto;
    }

    .reset-button {
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
    }

    .reset-button:hover {
        transform: scale(1.05);
        background: rgba(255, 0, 0, 0.9);
    }
</style> 