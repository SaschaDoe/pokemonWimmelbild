<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import Pokedex from './Pokedex.svelte';

    export let pokemon: Pokemon;
    export let onClose: () => void;

    let pokedexComponent: any;

    function handleClose() {
        if (pokedexComponent) {
            pokedexComponent.cleanup();
        }
        onClose();
    }
</script>

<div class="pokemon-details-overlay" on:click|self={handleClose}>
    <div class="pokemon-details-content">
        <button class="close-button" on:click={handleClose}>×</button>
        <Pokedex {pokemon} bind:this={pokedexComponent} />
    </div>
</div>

<style>
    .pokemon-details-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1500;
    }

    .pokemon-details-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        position: relative;
        max-width: 80%;
        max-height: 80vh;
        overflow-y: auto;
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
        transition: background-color 0.2s;
    }

    .close-button:hover {
        background: #f0f0f0;
    }
</style> 