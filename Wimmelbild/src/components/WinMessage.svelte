<script lang="ts">
    import type { Pokemon } from '../types/interfaces';
    import Pokedex from './Pokedex.svelte';

    export let onNewGame: () => void;
    export let foundPokemon: Pokemon | null;
</script>

<div class="win-message-overlay">
    <div class="win-message-content">
        <h2>Congratulations!</h2>
        <p>You found all the berries and caught the Pokémon {foundPokemon?.name}!</p>
        
        {#if foundPokemon}
            <div class="pokedex-container">
                <Pokedex pokemon={foundPokemon} />
            </div>
        {/if}
        
        <button on:click={onNewGame}>Play Again</button>
    </div>
</div>

<style>
    .win-message-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .win-message-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 80%;
        max-height: 80vh;
        overflow-y: auto;
    }

    .pokedex-container {
        margin: 2rem 0;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 0.5rem;
    }

    button {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 0.5rem;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background: #45a049;
    }

    h2 {
        color: #333;
        margin-bottom: 1rem;
    }

    p {
        color: #666;
        margin-bottom: 1.5rem;
    }
</style> 