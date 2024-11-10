<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import TypeBadge from './TypeBadge.svelte';
    import Pokedex from './Pokedex.svelte';
    
    export let targetPokemon: Pokemon;
    let showPokedex = false;
</script>

<div class="target-display">
    <h2>Find this Pokemon:</h2>
    <button 
        class="pokemon-image-button" 
        on:click={() => showPokedex = true}
        title="Click to view in Pokédex"
    >
        <img src={targetPokemon.image} alt={targetPokemon.name} />
    </button>
    <div class="pokemon-info">
        <p class="pokemon-name">{targetPokemon.name}</p>
        <div class="pokemon-types">
            {#each targetPokemon.types as type}
                <TypeBadge {type} />
            {/each}
        </div>
    </div>
</div>

<Pokedex 
    pokemon={targetPokemon} 
    show={showPokedex} 
    on:close={() => showPokedex = false}
/>

<style>
    .target-display {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .pokemon-info {
        text-align: center;
    }

    .pokemon-name {
        margin: 0.5rem 0;
        font-weight: bold;
    }

    .pokemon-types {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .pokemon-image-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .pokemon-image-button:hover {
        transform: scale(1.05);
    }

    img {
        width: 100px;
        height: 100px;
        object-fit: contain;
    }
</style> 